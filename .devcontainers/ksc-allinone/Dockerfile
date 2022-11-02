FROM ubuntu:22.04 as builder

ARG TARGETARCH

ARG USERNAME
ARG TOKEN

ENV ARCH=amd64
ENV HELM_VERSION=v3.10.1
ENV KUBESPHERE_VERSION=ksc
ENV KUBESPHERE_APISERVER=registry.cn-beijing.aliyuncs.com/kse/ks-apiserver:$KUBESPHERE_VERSION
ENV KUBESPHERE_CONTROLLER_MANAGER=registry.cn-beijing.aliyuncs.com/kse/ks-controller-manager:$KUBESPHERE_VERSION
ENV KUBESPHERE_CONSOLE=registry.cn-beijing.aliyuncs.com/kse/ks-console:$KUBESPHERE_VERSION
ENV KUBECTL=docker.io/kubesphere/kubectl:latest
ENV COREDNS=docker.io/coredns/coredns:1.8.7
ENV LOCAL_PATH_PROVISIONER=docker.io/rancher/local-path-provisioner:v0.0.21
ENV PAUSE=docker.io/rancher/mirrored-pause:3.6

WORKDIR /workspace

RUN apt update && apt install -y git jq tar wget skopeo

RUN  git clone --branch ksc --depth=1 https://$USERNAME:$TOKEN@github.com/kubesphere/kse-installer.git && \
     cp -r kse-installer/ks-core .

RUN mkdir images && echo "$KUBESPHERE_APISERVER\n $KUBESPHERE_CONTROLLER_MANAGER\n $KUBESPHERE_CONSOLE\n $KUBECTL\n $COREDNS\n $LOCAL_PATH_PROVISIONER\n $PAUSE" | \
    ( while read image; do skopeo copy docker://$image docker-archive:./images/$(echo $image | awk -F "/" '{print $NF}' | cut -d ":" -f 1).tar:$image --override-arch $TARGETARCH; done )

RUN wget https://get.helm.sh/helm-${HELM_VERSION}-linux-${TARGETARCH}.tar.gz && \
    tar -zxf helm-${HELM_VERSION}-linux-${TARGETARCH}.tar.gz && \
    mv linux-${TARGETARCH}/helm . && \
    rm -rf *linux-${TARGETARCH}* && \
    chmod +x ./helm


FROM rancher/k3s:v1.23.10-k3s1

WORKDIR /kubesphere

COPY --from=builder /workspace/ks-core ./ks-core
COPY --from=builder /workspace/images ./images
COPY --from=builder /workspace/helm /bin/helm

ADD bootstrap.sh /bin/bootstrap.sh

RUN chmod +x /bin/bootstrap.sh

HEALTHCHECK --interval=5s --timeout=3s \
  CMD wget -qO- http://localhost:30881/kapis/version || exit 1

ENTRYPOINT ["bootstrap.sh"]


