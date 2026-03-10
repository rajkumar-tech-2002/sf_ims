# Transition to k3s: Lightweight Kubernetes

This guide explains how to migrate your IMS deployment from standard k8s to k3s.

## Prerequisites
- A Linux machine or WSL2 (Ubuntu recommended).
- Docker installed and running.

## 1. Install k3s
Run the setup script to install k3s without the default Traefik ingress controller (to keep it lightweight):
```bash
chmod +x k3s/setup_k3s.sh
./k3s/setup_k3s.sh
```

## 2. Build and Deploy
The deployment script will build your Docker images and import them into the k3s internal registry:
```bash
chmod +x k3s/deploy_k3s.sh
./k3s/deploy_k3s.sh
```

## 3. Verify Deployment
Check the status of your pods and services:
```bash
sudo k3s kubectl get pods -n ims
sudo k3s kubectl get svc -n ims
```

The application should be accessible via your host IP on port 80.
