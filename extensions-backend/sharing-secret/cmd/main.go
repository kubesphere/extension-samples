package main

import (
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/klog/v2"
	"os"
	sharingsecret "sharingsecret"
	sharingsecretv1alpha1 "sharingsecret/pkg/api/sharingsecret/v1alpha1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/config"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/manager/signals"
)

func init() {
	log.SetLogger(klog.NewKlogr())
	_ = sharingsecretv1alpha1.AddToScheme(scheme.Scheme)
}

func main() {
	entryLog := log.Log.WithName("entrypoint")

	// Setup a Manager
	entryLog.Info("setting up manager")

	mgr, err := ctrl.NewManager(config.GetConfigOrDie(), ctrl.Options{
		Scheme: scheme.Scheme,
	})
	if err != nil {
		entryLog.Error(err, "unable to set up controller manager")
		os.Exit(1)
	}

	// Watch ReplicaSets and enqueue ReplicaSet object key
	if err = (&sharingsecret.Reconciler{}).SetupWithManager(mgr); err != nil {
		entryLog.Error(err, "unable to create controller")
		os.Exit(1)
	}

	entryLog.Info("starting manager")
	if err := mgr.Start(signals.SetupSignalHandler()); err != nil {
		entryLog.Error(err, "unable to run manager")
		os.Exit(1)
	}
}
