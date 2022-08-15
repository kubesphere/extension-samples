FROM node:lts-alpine

RUN apk update && apk add \
   bash \
   bash-completion \
   vim \
   curl \
   ca-certificates && \
   update-ca-certificates && \
   rm -rf /var/cache/apk/* && \
   curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.23.9/bin/linux/amd64/kubectl && \
   chmod +x ./kubectl && \
   mv ./kubectl /usr/local/bin/kubectl && \
   echo -e 'source /usr/share/bash-completion/bash_completion\nsource <(kubectl completion bash)' >>~/.bashrc && \
   curl -LO https://github.com/kubesphere/ksbuilder/releases/download/v0.0.1-alpha3/ksbuilder_0.0.1-alpha3_linux_amd64.tar.gz && \  
   tar -xzf ksbuilder_0.0.1-alpha3_linux_amd64.tar.gz && \
   chmod +x ./ksbuilder && \
   mv ./ksbuilder /usr/local/bin/ksbuilder && \
   curl -LO https://get.helm.sh/helm-v3.9.3-linux-amd64.tar.gz && \
   tar -xzvf helm-v3.9.3-linux-amd64.tar.gz && \
   chmod +x ./linux-amd64//helm && \
   mv ./linux-amd64//helm /usr/local/bin/helm

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
WORKDIR /Workspace/kubesphere

ENTRYPOINT ["entrypoint.sh"]
