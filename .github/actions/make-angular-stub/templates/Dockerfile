FROM nginxinc/nginx-unprivileged:1.25.1-alpine3.17-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/{{ .Env.NAME }}/ /usr/share/nginx/html/{{ .Env.APP_NAME }}/{{ .Env.NAME }}
