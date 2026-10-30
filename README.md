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
## Add Domain Name (jrenjq.com) to Droplet
### 1. Point the domain at the droplet (Namecheap)

1. Log in to Namecheap, go to **Domain List**, and click **Manage** next to your domain.
2. Open the **Nameservers** setting and make sure it's **Namecheap BasicDNS** (the default). If you've changed it to something else, the records below won't take effect.
3. Go to the **Advanced DNS** tab and add these records (delete any default parking-page records first, like the `URL Redirect` or the `CNAME` for `www` pointing to `parkingpage.namecheap.com`):

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `YOUR_DROPLET_IP` | Automatic |
| A Record | `www` | `YOUR_DROPLET_IP` | Automatic |

`@` means the bare domain (`example.com`), and `www` covers `www.example.com`.

### 2. Update nginx to use the domain

On the droplet, edit the `server_name` line. Replace `example.com` with your real domain:

```bash
sed -i 's/server_name _;/server_name example.com www.example.com;/' /etc/nginx/sites-available/myapp
nginx -t && systemctl reload nginx
```

Also change `listen 80 default_server;` to `listen 80;` if you want nginx to only answer for your domain (optional; leaving it means requests by raw IP still work too, which is handy for testing).

Now `http://example.com` should show your Hello world page and `http://example.com/api/test` should return the ping.

### 3. Add HTTPS (free, with Let's Encrypt)

Wait until the domain resolves to your droplet, then:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com
```

Certbot will:
- ask for your email,
- ask you to accept the terms,
- obtain the certificate and edit your nginx config to use it,
- offer to redirect HTTP to HTTPS (choose yes).

Certificates renew automatically. You can test that with:

```bash
certbot renew --dry-run
```
