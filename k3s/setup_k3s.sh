#!/bin/bash

# setup_k3s.sh - Install and configure k3s

echo "Starting k3s installation..."

# Install k3s without traefik (optional, but good for lightweight)
curl -sfL https://get.k3s.io | sh -s - --disable traefik

# Wait for k3s to be ready
echo "Waiting for k3s to be ready..."
sleep 10

# Check status
sudo k3s kubectl get nodes

echo "k3s installation complete. You can now use 'sudo k3s kubectl' to manage your cluster."
echo "To use standard 'kubectl', copy the config:"
echo "mkdir -p ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown $(id -u):$(id -g) ~/.kube/config"
