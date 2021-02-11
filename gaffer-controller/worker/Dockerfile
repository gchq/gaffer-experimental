ARG BASE_IMAGE_NAME=dtzar/helm-kubectl
ARG BASE_IMAGE_TAG=latest

FROM ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}

ARG GROUP=worker
ARG USER=worker

RUN mkdir /helm && chmod 777 /helm

RUN addgroup ${GROUP} && adduser -h /helm -G ${GROUP} -H -D -s /bin/bash ${USER}

USER ${USER}:${GROUP}
ENV HOME=/helm

ENTRYPOINT [ "bash", "-c" ]
