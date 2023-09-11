## Kube

Setup kube with 1 extra node

Install kube on master node

```bash
curl -sfL https://get.k3s.io | sh -
```

Get config file

```bash
k3s kubectl config view --raw
```

Copy config file to local machine '~/.kube/config'

Edit name as needed in the config file

```bash
  name: default # < here
contexts:
- context:
    cluster: default # < here
    user: default
  name: default # < here
current-context: default # < here
```

Copy master token

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

Install kube on worker node

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://{master_ip}5:6443 K3S_TOKEN={token} sh -
```

Install lends and kube control to view dashboard

```bash
brew install openlen
brew install kubectl
chmod 644 ~/.kube/config
```

Open Lens and you should see your cluster
