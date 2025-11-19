#!/bin/bash
echo "开始上传文件..."
rsync -av --progress /Users/xiongyufeng/developer/md/apps/web/dist/ root@43.142.191.118:/www/wwwroot/43.142.191.118/md/
echo "上传文件完成"
