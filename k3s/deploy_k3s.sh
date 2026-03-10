#!/bin/bash

# deploy_k3s.sh - Build and deploy IMS to k3s

# Ensure we are in the project root
PROJECT_ROOT=$(pwd)

echo "Building Docker images..."
docker build -t ims-server:latest ./server
docker build -t ims-client:latest ./client

echo "Importing images into k3s..."
# k3s uses containerd, so we export from docker and import to containerd
docker save ims-server:latest | sudo k3s ctr images import -
docker save ims-client:latest | sudo k3s ctr images import -

echo "Applying Kubernetes manifests..."
sudo k3s kubectl apply -f k3s/namespace.yaml
sudo k3s kubectl apply -f k3s/secrets.yaml
sudo k3s kubectl apply -f k3s/configmap.yaml
sudo k3s kubectl apply -f k3s/mysql.yaml
sudo k3s kubectl apply -f k3s/server.yaml
sudo k3s kubectl apply -f k3s/client.yaml

echo "Deployment complete. Check status with: sudo k3s kubectl get pods -n ims"
