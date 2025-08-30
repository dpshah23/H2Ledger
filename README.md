# H2Ledger - Green Hydrogen Credit Management Platform

## 🌱 Overview

H2Ledger is a comprehensive blockchain-based platform for managing green hydrogen credits. It provides a complete solution for tracking, trading, and auditing renewable hydrogen energy certificates with full transparency and regulatory compliance.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **Authentication**: JWT-based auth system
- **Notifications**: Sonner toast library

### Backend (Django + Python)
- **Framework**: Django 5.2.5 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens with custom user model
- **API**: RESTful endpoints with comprehensive error handling
- **Blockchain**: Web3.py integration for smart contract interaction
- **CORS**: Configured for cross-origin requests

### Blockchain (Ethereum + Solidity)
- **Smart Contract**: ERC20-based HydrogenCredits token
- **Development Environment**: Hardhat
- **Features**: Minting, burning, transfers with audit trails
- **Network**: Local development / Ethereum testnets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dpshah23/H2Ledger.git
cd H2Ledger
```

2. **Backend Setup**
```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Install dependencies
cd Backend/h2ledger
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

3. **Frontend Setup**
```bash
# In a new terminal
cd Frontend
npm install
npm run dev
```

4. **Blockchain Setup**
```bash
# In a new terminal
cd hydrogen-credits-contracts
npm install
npx hardhat compile

# Start local blockchain (optional)
npx hardhat node

# Deploy contracts (optional)
npx hardhat run scripts/deploy.js --network localhost
```

## 🌐 Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 📱 Features

### Dashboard
- Real-time analytics and portfolio overview
- Market trends and price tracking
- Transaction history with filtering
- Carbon offset impact visualization

### Credit Management
- Browse and search credit inventory
- Detailed credit information with facility data
- Transfer credits between accounts
- Real-time price updates and market data

### Audit Portal (Regulator Access)
- Transaction verification workflow
- Compliance monitoring dashboard
- Audit trail with certification tracking
- Export audit reports

### Authentication
- Secure user registration and login
- Role-based access control (User, Regulator, Admin)
- JWT token management
- Protected routes and API endpoints

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOW_ALL_ORIGINS=True
```

**Blockchain**
```env
ALCHEMY_URL=your-alchemy-url
PRIVATE_KEY=your-private-key
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout

### Dashboard
- `GET /api/dashboard/analytics/` - Dashboard statistics
- `GET /api/dashboard/transactions/` - Recent transactions

### Credits
- `GET /api/credits/` - List user credits
- `GET /api/credits/{id}/` - Credit details
- `POST /api/credits/transfer/` - Transfer credits

### Audit (Regulator only)
- `GET /api/audit/transactions/` - All transactions for audit
- `POST /api/audit/verify/{id}/` - Verify transaction

## 🛡️ Security Features

- JWT-based authentication with secure token handling
- CORS protection with configurable origins
- Input validation and sanitization
- Role-based access control (RBAC)
- Blockchain transaction signing
- Audit trail for all operations

## 🎨 UI Components

Built with shadcn/ui providing:
- Responsive design with mobile-first approach
- Dark/light theme support
- Accessible components (ARIA compliant)
- Modern glass-morphism design elements
- Interactive charts and data visualizations

## 🔍 Testing

### Backend Tests
```bash
cd Backend/h2ledger
python manage.py test
```

### Frontend Tests
```bash
cd Frontend
npm run test
```

### Smart Contract Tests
```bash
cd hydrogen-credits-contracts
npx hardhat test
```

## 📦 Deployment

### Production Backend
1. Configure production database (PostgreSQL)
2. Set production environment variables
3. Collect static files: `python manage.py collectstatic`
4. Use production WSGI server (gunicorn)

### Production Frontend
1. Build for production: `npm run build`
2. Serve static files with nginx or similar
3. Configure environment-specific API URLs

### Smart Contract Deployment
1. Configure network in hardhat.config.js
2. Deploy to testnet/mainnet: `npx hardhat run scripts/deploy.js --network <network>`
3. Update contract addresses in backend configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review API documentation at `/api/docs`

## 🚀 Roadmap

- [ ] Integration with major carbon registries
- [ ] Mobile application development
- [ ] Advanced analytics and reporting
- [ ] Multi-chain support
- [ ] AI-powered market predictions
- [ ] Integration with IoT sensors for real-time data

---

**Built with ❤️ for a sustainable future**
