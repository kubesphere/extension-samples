package sharing_secret

import (
	"context"
	"github.com/go-logr/logr"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/sets"
	"k8s.io/client-go/tools/record"
	"reflect"
	"runtime"
	"sharingsecret/pkg/api/sharingsecret/v1alpha1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
	"sigs.k8s.io/controller-runtime/pkg/source"
	"time"
)

const (
	controllerName   = "sharing-secret-controller"
	sharingSecretRef = "experimental.kubesphere.io/sharingsecret-ref"
	reconcilePeriod  = 5 * time.Second
)

// Reconciler reconciles a User object
type Reconciler struct {
	recorder record.EventRecorder
	logger   logr.Logger
	client.Client
}

func (r *Reconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Client = mgr.GetClient()
	r.logger = ctrl.Log.WithName(controllerName)
	r.recorder = mgr.GetEventRecorderFor(controllerName)

	return ctrl.NewControllerManagedBy(mgr).
		Named(controllerName).
		WithOptions(controller.Options{
			MaxConcurrentReconciles: runtime.NumCPU(),
		}).Watches(&source.Kind{Type: &corev1.Secret{}}, handler.EnqueueRequestsFromMapFunc(
		func(object client.Object) []reconcile.Request {
			sharingSecretName := object.GetLabels()[sharingSecretRef]
			if sharingSecretName != "" {
				return []reconcile.Request{{NamespacedName: types.NamespacedName{Name: sharingSecretName}}}
			} else {
				return []reconcile.Request{}
			}
		})).
		For(&v1alpha1.SharingSecret{}).
		Complete(r)
}

func (r *Reconciler) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
	logger := r.logger.WithValues("sharingsecret", req.NamespacedName)
	sharingSecret := &v1alpha1.SharingSecret{}
	err := r.Get(ctx, req.NamespacedName, sharingSecret)
	if err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	if err := r.sync(ctx, sharingSecret); err != nil {
		logger.Error(err, "failed to sync sharing secret")
		return reconcile.Result{RequeueAfter: reconcilePeriod}, err
	}

	return reconcile.Result{}, nil
}

func (r *Reconciler) sync(ctx context.Context, sharingSecret *v1alpha1.SharingSecret) error {
	logger := r.logger.WithValues("sharingsecret", sharingSecret.Name)
	targetNamespaces := sets.NewString()

	if len(sharingSecret.Spec.Target.Namespaces) > 0 {
		for _, namespace := range sharingSecret.Spec.Target.Namespaces {
			targetNamespaces.Insert(namespace.Name)
		}
	}else if  sharingSecret.Spec.Target.NamespaceSelector != nil {
		selector, err := metav1.LabelSelectorAsSelector(sharingSecret.Spec.Target.NamespaceSelector)
		if err != nil {
			logger.Error(err, "failed to parse namespace selector")
			return err
		}
		namespaces := &corev1.NamespaceList{}
		if err := r.List(ctx, namespaces, &client.ListOptions{LabelSelector: selector}); err != nil {
			logger.Error(err, "failed to fetch namespaces")
			return err
		}
		for _, namespace := range namespaces.Items {
			targetNamespaces.Insert(namespace.Name)
		}
	}

	if err := r.cleanup(ctx, sharingSecret, targetNamespaces); err != nil {
		logger.Error(err, "failed to cleanup secret")
		return err
	}

	originSecret := &corev1.Secret{}
	if err := r.Get(ctx, types.NamespacedName{
		Namespace: sharingSecret.Spec.SecretRef.Namespace,
		Name:      sharingSecret.Spec.SecretRef.Name,
	}, originSecret); err != nil {
		logger.Error(err, "failed to fetch secret", "secret", sharingSecret.Spec.SecretRef)
		return client.IgnoreNotFound(err)
	}

	if originSecret.Labels[sharingSecretRef] != sharingSecret.Name {
		if originSecret.Labels == nil {
			originSecret.Labels = make(map[string]string, 0)
		}
		originSecret.Labels[sharingSecretRef] = sharingSecret.Name
		if err := r.Update(ctx, originSecret); err != nil {
			logger.Error(err, "failed to update secret", "secret", sharingSecret.Spec.SecretRef)
			return err
		}
	}

	for _, namespace := range targetNamespaces.List() {
		if err := r.createOrUpdateSecret(ctx, originSecret, sharingSecret, namespace); err != nil {
			return err
		}
	}
	return nil
}

func (r *Reconciler) createOrUpdateSecret(ctx context.Context, src *corev1.Secret, owner *v1alpha1.SharingSecret, namespace string) error {
	dist := &corev1.Secret{}
	err := r.Get(ctx, types.NamespacedName{
		Namespace: namespace,
		Name:      src.Name,
	}, dist)

	logger := r.logger.WithValues("namespace", namespace, "secret", src.Name)

	if err != nil && !errors.IsNotFound(err) {
		logger.Error(err, "failed to fetch secret")
		return err
	}

	if errors.IsNotFound(err) {
		created := &corev1.Secret{
			ObjectMeta: metav1.ObjectMeta{
				Name:        src.Name,
				Namespace:   namespace,
				Annotations: src.Annotations,
				Labels:      src.Labels,
			},
			Data: src.Data,
			Type: src.Type,
		}
		if err := controllerutil.SetControllerReference(owner, created, r.Scheme()); err != nil {
			logger.Error(err, "failed to set owner reference")
			return err
		}
		if err := r.Create(ctx, created); err != nil {
			logger.Error(err, "failed to create secret")
			return err
		}
		return nil
	}
	controlled := metav1.IsControlledBy(dist, owner)
	changed := !reflect.DeepEqual(src.Labels, dist.Labels) ||
		!reflect.DeepEqual(src.Annotations, dist.Annotations) ||
		!reflect.DeepEqual(src.Type, dist.Type) ||
		!reflect.DeepEqual(src.Data, dist.Data)

	if controlled && changed {
		updated := dist.DeepCopy()
		updated.Labels = src.Labels
		updated.Annotations = src.Annotations
		updated.Data = src.Data
		updated.Type = src.Type
		if err := r.Client.Update(ctx, updated); err != nil {
			logger.Error(err, "failed to update secret")
			return err
		}
	}
	return nil
}

func (r *Reconciler) cleanup(ctx context.Context, owner *v1alpha1.SharingSecret, targetNamespaces sets.String) error {
	secrets := &corev1.SecretList{}
	if err := r.List(ctx, secrets, &client.ListOptions{}); err != nil {
		return err
	}
	for _, secret := range secrets.Items {
		if metav1.IsControlledBy(&secret, owner) && !targetNamespaces.Has(secret.Namespace) {
			if err := r.Delete(ctx, &secret); err != nil {
				r.logger.WithValues("namespace", secret.Namespace, "secret", secret.Name).Error(err, "failed to cleanup")
				return err
			}
		}
	}
	return nil
}
