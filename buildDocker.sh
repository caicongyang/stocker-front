#!/bin/bash

# 设置变量
IMAGE_NAME="stocker-front"
VERSION="latest"
DOCKER_HUB_USERNAME="caicongyang"  # 替换为你的Docker Hub用户名
CONTAINER_NAME="stocker-front"
PORT=80

# 构建Docker镜像
echo "开始构建Docker镜像..."
docker build -t $IMAGE_NAME:$VERSION .

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo "Docker镜像构建失败!"
    exit 1
fi

# 标记镜像
echo "标记Docker镜像..."
docker tag $IMAGE_NAME:$VERSION $DOCKER_HUB_USERNAME/$IMAGE_NAME:$VERSION

# 推送到Docker Hub
echo "推送镜像到Docker Hub..."
docker push $DOCKER_HUB_USERNAME/$IMAGE_NAME:$VERSION



echo "Docker构建和推送完成!"
