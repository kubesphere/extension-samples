FROM golang:alpine3.16 as builder

ENV ARCH=amd64
ENV HELM_VERSION=v3.9.3
ENV KUBESPHERE_VERSION=feature-pluggable
ENV KUBESPHERE_APISERVER=kubespheredev/ks-apiserver:$KUBESPHERE_VERSION
ENV KUBESPHERE_CONTROLLER_MANAGER=kubespheredev/ks-controller-manager:$KUBESPHERE_VERSION
ENV KUBESPHERE_CONSOLE=kubespheredev/ks-console:$KUBESPHERE_VERSION
ENV DEFAULTBACKEND=mirrorgooglecontainers/defaultbackend-amd64:1.4
ENV KUBECTL=kubesphere/kubectl:latest
ENV COREDNS=rancher/mirrored-coredns-coredns:1.9.1
ENV LOCAL_PATH_PROVISIONER=rancher/local-path-provisioner:v0.0.21

WORKDIR /workspace

RUN apk --no-cache add bash git jq tar curl

RUN  git clone --branch feature-pluggable --depth=1 https://github.com/kubesphere/kubesphere.git && \
     cp -r kubesphere/config/ks-core . && cp kubesphere/config/crds/* ks-core/crds

ADD download-frozen-image-v2.sh .

RUN mkdir images && echo -e "$KUBESPHERE_APISERVER $KUBESPHERE_CONTROLLER_MANAGER $KUBESPHERE_CONSOLE $DEFAULTBACKEND $KUBECTL $COREDNS $LOCAL_PATH_PROVISIONER" | \
    xargs -t -n1 bash download-frozen-image-v2.sh

RUN if [[ $(arch) == aarch64* ]]; then ARCH=arm64; fi && \
    wget https://get.helm.sh/helm-${HELM_VERSION}-linux-${ARCH}.tar.gz && \
    tar -zxf helm-${HELM_VERSION}-linux-${ARCH}.tar.gz && \
    mv linux-${ARCH}/helm . && \
    rm -rf *linux-${ARCH}* && \
    chmod +x ./helm


FROM rancher/k3s:v1.23.9-k3s1

WORKDIR /kubesphere

COPY --from=builder /workspace/ks-core ./ks-core
COPY --from=builder /workspace/images ./images
COPY --from=builder /workspace/helm /bin/helm

ADD bootstrap.sh /bin/bootstrap.sh

RUN chmod +x /bin/bootstrap.sh

HEALTHCHECK --interval=5s --timeout=3s \
  CMD wget -qO- http://localhost:30881/kapis/version || exit 1

ENTRYPOINT ["bootstrap.sh"]


