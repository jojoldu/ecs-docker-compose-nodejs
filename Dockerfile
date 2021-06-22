FROM alpine:3.11

RUN apt-get update && apt-get install -y \
    language-pack-ko \
    fonts-nanum \
    fonts-nanum-coding

# Language
RUN locale-gen ko_KR.UTF-8
ENV LANG ko_KR.UTF-8
ENV LANGUAGE ko_KR.UTF-8
ENV LC_ALL ko_KR.UTF-8

# Timezone
ENV TIME_ZONE=Asia/Seoul

# Set the timezone in docker
RUN ln -snf /usr/share/zoneinfo/$TIME_ZONE /etc/localtime && echo $TIME_ZONE > /etc/timezone

# Create Directory for the Container
WORKDIR /usr/ecs-docker-compose-nodejs

# Only copy the package.json file to work directory
COPY package.json .
RUN npm install

# Copy all other source code to work directory
COPY . .

# TypeScript
RUN npm run tsc

CMD [ "npm", "start" ]
