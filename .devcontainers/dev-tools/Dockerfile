FROM node:lts-alpine

ARG TARGETARCH
ARG TARGETOS
ARG HELM_VERSION=v3.10.1
ARG KUBECTL_VERSION=v1.23.10
ARG KSBUILDER_VERSION=0.0.1-alpha5
ARG YARN_REGISTRY=https://registry.npmmirror.com/

RUN apk update && apk add \
   bash \
   bash-completion \
   vim \
   curl \
   ca-certificates && \
   update-ca-certificates && \
   rm -rf /var/cache/apk/* && \
   TMPDIR=$(mktemp -d);cd $TMPDIR && \
   curl -LO https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/${TARGETOS}/${TARGETARCH}/kubectl && \
   chmod +x ./kubectl && \
   mv ./kubectl /usr/local/bin/kubectl && \
   echo -e 'source /usr/share/bash-completion/bash_completion\nsource <(kubectl completion bash)' >>~/.bashrc && \
   curl -LO https://github.com/kubesphere/ksbuilder/releases/download/v${KSBUILDER_VERSION}/ksbuilder_${KSBUILDER_VERSION}_${TARGETOS}_${TARGETARCH}.tar.gz && \
   tar -xzf ksbuilder_${KSBUILDER_VERSION}_${TARGETOS}_${TARGETARCH}.tar.gz && \
   chmod +x ./ksbuilder && \
   mv ./ksbuilder /usr/local/bin/ksbuilder && \
   curl -LO https://get.helm.sh/helm-${HELM_VERSION}-${TARGETOS}-${TARGETARCH}.tar.gz && \
   tar -xzvf helm-${HELM_VERSION}-${TARGETOS}-${TARGETARCH}.tar.gz && \
   chmod +x ./${TARGETOS}-${TARGETARCH}/helm && \
   mv ./${TARGETOS}-${TARGETARCH}/helm /usr/local/bin/helm && \
   rm -rf $TMPDIR

RUN yarn config set ${YARN_REGISTRY}

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
