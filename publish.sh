#!/bin/bash
echo "开始构建"
npm run build:cli
echo "完成构建"
echo "开始上传文件到我的轻量应用服务器（腾讯云）..."
rsync -avz --delete -e "ssh -i ~/developer/tencent_light_server_shanghai.pem -p 22" ./apps/web/dist/ root@43.142.191.118:/www/wwwroot/43.142.191.118/md/
echo "我的轻量应用服务器（腾讯云）上传完成"
echo "--------------------------------"
echo "开始上传文件到蹭试界 ops md 文件夹..."
rsync -avz --delete -e "ssh -i ./keys/Shijie-static-Key.pem -p 7022" ./apps/web/dist/ work@118.89.240.44:/home/work/front/ops/md/
echo '蹭试界 ops md 文件夹上传完成'
echo "--------------------------------"
echo "上传文件完成"
