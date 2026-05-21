# Deployment Guide - User Service

## MongoDB Setup (DevOps/Infrastructure Team)

### Local Development
Uses in-memory MongoDB automatically if `MONGO_URI` is not set.

```bash
docker-compose up  # Includes MongoDB service
```

### Production Deployment

**1. MongoDB Cluster Setup (Your Responsibility)**
- Use MongoDB Atlas (Cloud) or self-hosted MongoDB 4.4+
- Enable authentication with strong username/password
- Configure network access (firewall rules)
- Backup enabled (point-in-time recovery)
- Monitoring enabled

**2. Connection String Format**

**Docker/Self-Hosted:**
```
mongodb://username:password@host:27017/chatsystem?authSource=admin&replicaSet=rs0
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster-name.mongodb.net/chatsystem?retryWrites=true&w=majority
```

**3. Environment Variables for Production**

```env
# REQUIRED
MONGO_URI=<your-connection-string>

# OPTIONAL - Connection Pooling (recommended for high traffic)
MONGO_POOL_SIZE=50           # Increase from default 10 for production
MONGO_MIN_POOL_SIZE=5        # Minimum idle connections
MONGO_SOCKET_TIMEOUT=60000   # 60 seconds for long operations
MONGO_CONNECT_TIMEOUT=15000  # 15 seconds connection timeout
```

### Connection Pooling Explained

| Setting | Default | Purpose | High-Traffic |
|---------|---------|---------|---|
| **MONGO_POOL_SIZE** | 10 | Max concurrent connections | 30-50 |
| **MONGO_MIN_POOL_SIZE** | 2 | Always keep this many ready | 5-10 |
| **MONGO_SOCKET_TIMEOUT** | 45000ms | How long to wait for response | 60000ms |

**Why Pool Size Matters?**
- Each API request may need a DB connection
- If 100 requests arrive simultaneously but pool size = 10, 90 requests wait
- Bigger pool = more server memory used
- Find balance: `(Expected QPS) / (Avg query time in seconds)`

### Performance Under Load

**Testing Pooling**
```bash
# Install Apache Bench
npm install -g ab

# Load test: 1000 requests, 50 concurrent
ab -n 1000 -c 50 http://localhost:3002/users
```

**Monitor in Production**
```bash
# Check MongoDB connection pool status
db.serverStatus().connections

# Expected output:
# { "current": 15, "available": 35, "totalCreated": 50 }
```

## Deployment Steps

### 1. Setup MongoDB (Infrastructure Team)
```bash
# Atlas: Create cluster, get connection string
# Self-hosted: Install, enable auth, create database
```

### 2. Set Environment Variables
```bash
export MONGO_URI="<production-connection-string>"
export MONGO_POOL_SIZE="50"
export PORT="3002"
export AUTH_VALIDATE_URL="http://auth-service:3001/auth/validate"
```

### 3. Deploy Services
```bash
# Option 1: Docker Compose
docker-compose up -d

# Option 2: Kubernetes
kubectl apply -f deployment.yml

# Option 3: Manual
npm install
npm start
```

### 4. Verify Deployment
```bash
# Health check
curl http://localhost:3002/

# Expected response:
# {"service":"user-service","status":"ok"}

# List users (requires valid JWT token)
curl -H "Authorization: Bearer <token>" http://localhost:3002/users
```

## Troubleshooting

### Problem: "Unable to connect to MongoDB"
**Causes:**
- MongoDB not running
- Wrong connection string
- Network/firewall issues
- Authentication failed

**Solutions:**
```bash
# Test connection
mongo <connection-string>

# Check connection string format
echo $MONGO_URI

# Verify network access (if using cloud)
ping cluster.mongodb.net

# Check logs
docker logs <container-name>
```

### Problem: "Timeout connecting to MongoDB"
**Causes:**
- MongoDB server down
- Connection pool exhausted
- Network latency too high

**Solutions:**
```bash
# Increase timeouts in .env
MONGO_CONNECT_TIMEOUT=20000
MONGO_SOCKET_TIMEOUT=90000

# Increase pool size
MONGO_POOL_SIZE=100

# Restart service
docker-compose restart
```

### Problem: "Too many connections" Error
**Cause:** Pool size too small for traffic volume

**Solution:**
```bash
# Calculate required pool size
QPS = 1000  # Queries per second
QueryTime = 0.1  # 100ms average
PoolSize = QPS * QueryTime = 100

MONGO_POOL_SIZE=100  # Set in .env
```

## Production Checklist

- [ ] MongoDB cluster created with authentication
- [ ] Connection string tested and verified
- [ ] Pool size configured based on traffic estimates
- [ ] Backups enabled and tested
- [ ] Monitoring/alerting configured
- [ ] Firewall rules allow service → MongoDB
- [ ] Service deployed and health checks passing
- [ ] Load test completed successfully
- [ ] Graceful shutdown configured (SIGTERM handling)

## Scaling

**If experiencing slow queries:**
1. Increase `MONGO_POOL_SIZE` by 10-20%
2. Add indexes to frequently queried fields
3. Monitor `MONGO_SOCKET_TIMEOUT` - increase if queries are slow

**If MongoDB at capacity:**
1. Enable MongoDB sharding (horizontal scaling)
2. Use MongoDB Atlas auto-scaling
3. Implement caching layer (Redis)

## Support

For issues, contact:
- **MongoDB Setup:** Infrastructure team
- **Service Issues:** Development team
- **Performance:** DevOps + Development team
