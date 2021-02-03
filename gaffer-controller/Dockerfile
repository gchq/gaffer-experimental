ARG BUILDER_IMAGE_NAME=maven
ARG BUILDER_IMAGE_TAG=3.6.3-openjdk-8

ARG BASE_IMAGE_NAME=debian
ARG BASE_IMAGE_TAG=stretch-20201117-slim


FROM ${BUILDER_IMAGE_NAME}:${BUILDER_IMAGE_TAG} as builder
WORKDIR /workspace

RUN git clone https://github.com/gchq/gaffer-experimental.git
RUN cd gaffer-experimental && \
    mvn clean install -Pquick -pl :gaffer-controller -am

FROM ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
ARG USER=spring
ARG GROUP=spring

RUN groupadd ${GROUP} && useradd --home-dir /spring --gid ${GROUP} --no-create-home --shell /bin/bash ${USER}

RUN mkdir -p /usr/share/man/man1 && \
    apt -qq update &&  \
    apt -qq install -y openjdk-8-jre-headless

USER ${USER}
WORKDIR /spring
COPY --from=builder /workspace/gaffer-experimental/target/gaffer-controller-1.13.0.jar ./gaffer-controller.jar
ENTRYPOINT [ "java", "-jar", "./gaffer-controller.jar"]
