# DEAL-BACKEND
https://towardsdatascience.com/deploying-web-applications-with-docker-in-aws-fargate-bb942de733a4

aws ecr create-repository \
--repository-name deal-backend \
--image-scanning-configuration scanOnPush=true

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 196461569389.dkr.ecr.us-east-1.amazonaws.com

docker tag af16205e3738 196461569389.dkr.ecr.us-east-1.amazonaws.com/deal-backend

docker push 196461569389.dkr.ecr.us-east-1.amazonaws.com/deal-backend