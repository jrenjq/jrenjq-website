# jrenjq-website

## DigitalOcean Ubuntu Droplet First-time Setup
> Ubuntu 24.04 (LTS) x64

> Basic / 1 vCPU / 1 GB RAM / 25 GB Disk
### Check RAM and Disk
```
free -h    # RAM (and swap, if enabled)
df -h /    # disk size
```
### Upgrade dependencies
```
apt update && apt upgrade -y
```
### Add Swap File
```
fallocate -l 1G /swapfile    # create a file called /swapfile and reserve 1 GB of disk space for it
chmod 600 /swapfile          # only root can read/write it (swap can hold sensitive data from RAM)
mkswap /swapfile             # format the file as swap space (writes a header the kernel recognizes)
swapon /swapfile             # tell the kernel to start using it as swap right now
echo '/swapfile none swap sw 0 0' >> /etc/fstab    # append a line to /etc/fstab so swap turns on automatically after reboots

free -h    # the Swap row should show about 1.0Gi
```
### Install Nginx, Python PIP & Venv, and UFW
```
apt install -y nginx python3-venv python3-pip ufw
```
### UFH Configuration
```
ufw allow OpenSSH          # open port 22 so you can still log in over SSH (do this BEFORE enabling the firewall, or you could lock yourself out)
ufw allow 'Nginx Full'     # open ports 80 (HTTP) and 443 (HTTPS) so people can reach your website
ufw --force enable         # turn the firewall on; --force skips the "this may disrupt SSH connections, proceed?" prompt

ufw status    # should list OpenSSH and Nginx Full as ALLOW
```
