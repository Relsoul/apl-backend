# 临时邮箱
https://tempmail.plus/zh

# 安装
```
npm install
```

# 配置项

参考.env文件 .env.production为docker运行时的配置项

# 本地开发
```
npm run start:dev
```
- 确保本地已启动mongodb环境并且正确配置mongodb 或者使用docker快速启动mongodb
- 确保邮箱apikey正确申请
- 确保用户填写时投票邮箱地址为临时邮箱地址(mailslurp邮箱目前发送有黑名单校验，目前只有临时邮箱是放开状态，因特殊性目前无smtp邮箱可以发件用来测试)


# docker运行
```
docker-compose up -d
```

# 访问
[http://127.0.0.1:7790/](http://127.0.0.1:7790/)

# api文档
[https://www.apifox.cn/apidoc/project-1742663/api-43577549](https://www.apifox.cn/apidoc/project-1742663/api-43577549)

建议使用apifox进行调试
邀请链接【Apifox】soul006邀请你加入qitu [https://www.apifox.cn/web/invite?token=LnB7UdcINEhnkWBKEByYc](https://www.apifox.cn/web/invite?token=LnB7UdcINEhnkWBKEByYc)

# 目录结构
- main.ts `主入口`
- vl.pipe.ts `自定义校验`
- app.service.ts `用户层服务`
- app.controller.ts `用户控制层`
- app.module.ts `app主module`
- app.dto.ts `dto校验类`
- all-exceptions.ts `错误捕捉层 复写nest log`
- utils
- - customcalidator.ts `自定义校验装饰器`
- - result.ts `全局api返回定义`
- schema `数据库层`
- - candidate.schema.ts `选举人`
- - email.schema.ts `邮件发送`
- - vote.schema.ts `选举项目`
- - vote-log.schema.ts `投票日志`
- admin `管理api服务层`