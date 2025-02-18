#!/bin/sh

# 替换 index.html 中的环境变量占位符
if [ ! -z "$VITE_API_URL" ]; then
    sed -i "s|VITE_API_URL_PLACEHOLDER|$VITE_API_URL|g" /usr/share/nginx/html/index.html
else
    sed -i "s|VITE_API_URL_PLACEHOLDER|http://localhost:8888|g" /usr/share/nginx/html/index.html
fi

# 执行 CMD
exec "$@" 