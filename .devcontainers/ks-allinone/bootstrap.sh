#!/bin/sh

(trap '' HUP INT
    until which containerd ; do echo "waiting for containerd"; sleep 2; done;

    echo "************************************"
    echo     1. Loading KubeSphere images
    echo "************************************"

    for image in $(ls /kubesphere/images/*.tar); do ctr i import ${image}; done
    
    # rancher/mirrored-coredns-coredns:1.9.1 not support multi arch
    ctr i tag docker.io/coredns/coredns:1.8.7 docker.io/rancher/mirrored-coredns-coredns:1.9.1 && \
    ctr i rm docker.io/coredns/coredns:1.8.7
 
    echo "************************************"
    echo     2. Launching KubeSphere
    echo "************************************"

    kubectl create ns kubesphere-controls-system

    helm upgrade --install ks-core ./ks-core/ --namespace kubesphere-system --create-namespace \
    --kubeconfig /etc/rancher/k3s/k3s.yaml \
    --set image.ks_apiserver_repo=kubespheredev/ks-apiserver \
    --set image.ks_apiserver_tag=feature-pluggable \
    --set image.ks_controller_manager_repo=kubespheredev/ks-controller-manager \
    --set image.ks_controller_manager_tag=feature-pluggable \
    --set image.ks_console_repo=kubespheredev/ks-console \
    --set image.ks_console_tag=feature-pluggable \
    --set apiserver.nodePort=30881 \
    --set image.pullPolicy=Always
    
) </dev/null 2>&1 1>nohup.out &

#########################################################################################################################################
# DISCLAIMER																																																														#
# Copied from https://github.com/moby/moby/blob/ed89041433a031cafc0a0f19cfe573c31688d377/hack/dind#L28-L37															#
# Permission granted by Akihiro Suda <akihiro.suda.cz@hco.ntt.co.jp> (https://github.com/rancher/k3d/issues/493#issuecomment-827405962)	#
# Moby License Apache 2.0: https://github.com/moby/moby/blob/ed89041433a031cafc0a0f19cfe573c31688d377/LICENSE														#
#########################################################################################################################################
if [ -f /sys/fs/cgroup/cgroup.controllers ]; then
	# move the processes from the root group to the /init group,
  # otherwise writing subtree_control fails with EBUSY.
  mkdir -p /sys/fs/cgroup/init
  busybox xargs -rn1 < /sys/fs/cgroup/cgroup.procs > /sys/fs/cgroup/init/cgroup.procs || :
  # enable controllers
  sed -e 's/ / +/g' -e 's/^/+/' <"/sys/fs/cgroup/cgroup.controllers" >"/sys/fs/cgroup/cgroup.subtree_control"
fi

exec /bin/k3s server --cluster-init \
                --tls-san=0.0.0.0 \
                --tls-san=kubesphere \
                --disable-cloud-controller \
                --disable=servicelb,traefik,metrics-server \
                --write-kubeconfig-mode=644 \
                "$@"

