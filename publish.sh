#!/bin/bash
echo "开始构建"
npm run build:cli
echo "完成构建"
echo "开始上传文件..."
# rsync -av --progress /Users/xiongyufeng/developer/md/apps/web/dist/ root@43.142.191.118:/www/wwwroot/43.142.191.118/md/
# 蹭试界 ops md
scp -i ./keys/Shijie-static-Key.pem -P 7022 -r ./apps/web/dist/* work@118.89.240.44:/home/work/front/ops/md/
echo '远程ops文件夹部署完成'
echo "上传文件完成"
