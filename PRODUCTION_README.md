# H2Ledger - Production-Ready Hydrogen Credits Trading Platform

## 🌟 Overview

H2Ledger is a comprehensive blockchain-based platform for managing, trading, and auditing green hydrogen credits. The platform combines modern web technologies with blockchain integration to provide a secure, transparent, and efficient solution for carbon credit management.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React Context
- **Routing**: React Router v6
- **Authentication**: JWT-based auth with protected routes
- **Notifications**: Sonner toast system

### Backend (Django)
- **Framework**: Django 5.2.5
- **API**: Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with custom User model
- **Web3 Integration**: Web3.py for blockchain interactions
- **CORS**: Configured for frontend integration

### Blockchain (Hardhat + Solidity)
- **Framework**: Hardhat
- **Smart Contract**: ERC20-based HydrogenCredits token
- **Network**: Local development / Ethereum testnets
- **Features**: Minting, burning, transfers, audit trails

## 🚀 Features

### ✅ Completed Features

#### 🔐 Authentication & Authorization
- User registration and login
- JWT token-based authentication
- Protected routes and role-based access
- User profile management

#### 📊 Dashboard Analytics
- Real-time credit portfolio overview
- Market price trends and statistics
- Transaction history and analytics
- Environmental impact tracking (CO₂ offset)

#### 💳 Credit Management
- Comprehensive credit portfolio view
- Advanced search and filtering
- Credit transfer functionality
- Detailed credit information modals
- Real-time balance updates

#### 🔍 Audit Portal
- Regulatory compliance tracking
- Transaction verification system
- Audit trail management
- Export capabilities for reports
- Multi-level verification status

#### 🔗 Blockchain Integration
- Smart contract interaction layer
- Web3 wallet connectivity preparation
- Transaction recording on blockchain
- Automated credit minting and burning

## 🛠️ Technical Implementation

### Backend API Endpoints

```
Authentication:
├── POST /api/auth/register/     # User registration
├── POST /api/auth/login/        # User login
└── POST /api/auth/refresh/      # Token refresh

Dashboard:
├── GET  /api/dashboard/analytics/     # Dashboard statistics
├── GET  /api/dashboard/transactions/  # Recent transactions
└── GET  /api/health/                  # System health check

Credits:
├── GET  /api/credits/           # List user credits
├── GET  /api/credits/{id}/      # Credit details
└── POST /api/credits/transfer/  # Transfer credits

Blockchain:
├── GET  /api/blockchain/network-info/  # Network status
├── POST /api/blockchain/mint/          # Mint new credits
└── POST /api/blockchain/transfer/      # Blockchain transfer
```

### Frontend Component Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── CreditCard.tsx         # Credit display component
│   ├── DashboardStats.tsx     # Statistics widgets
│   └── TransactionTable.tsx   # Transaction display
├── pages/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── Credits.tsx            # Credit management
│   ├── Audit.tsx              # Audit portal
│   ├── Login.tsx              # Authentication
│   └── Register.tsx           # User registration
├── services/
│   ├── api.ts                 # API client
│   ├── auth.ts                # Authentication service
│   ├── credits.ts             # Credit operations
│   └── dashboard.ts           # Dashboard data
├── context/
│   ├── AuthContext.tsx        # Authentication state
│   └── ThemeContext.tsx       # Theme management
└── utils/
    ├── constants.ts           # API endpoints
    ├── validation.ts          # Form validation
    └── wallet.ts              # Wallet integration
```

### Smart Contract Features

```solidity
contract HydrogenCredits {
    // ERC20 token functionality
    function mint(address to, uint256 amount) external onlyOwner;
    function burn(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    
    // Market features
    function setMarketPrice(uint256 price) external onlyOwner;
    function getMarketPriceTrend() external view returns (uint256[] memory);
    
    // Audit features
    function getTransactionLog(address user) external view returns (Transaction[] memory);
    function getTotalEmissionsOffset() external view returns (uint256);
}
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dpshah23/H2Ledger.git
cd H2Ledger
```

2. **Backend Setup**
```bash
cd Backend/h2ledger
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Starts on http://localhost:8000
```

3. **Frontend Setup**
```bash
cd Frontend
npm install
npm run dev  # Starts on http://localhost:3001
```

4. **Blockchain Setup** (Optional for full blockchain features)
```bash
cd hydrogen-credits-contracts
npm install
npx hardhat node  # Local blockchain
npx hardhat run scripts/deploy.js --network localhost  # Deploy contract
```

### Default Credentials
- **Username**: testuser
- **Password**: testpassword123

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
BLOCKCHAIN_NETWORK_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_BLOCKCHAIN_NETWORK=localhost
```

### Database Configuration

The platform uses SQLite for development and supports PostgreSQL for production:

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Blockchain Configuration

```python
# settings.py
BLOCKCHAIN_SETTINGS = {
    'NETWORK_URL': 'http://127.0.0.1:8545',
    'CHAIN_ID': 31337,
    'CONTRACT_ADDRESS': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    'PRIVATE_KEY': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    'GAS_LIMIT': 3000000,
    'GAS_PRICE': 20000000000,
}
```

## 📱 Usage

### Dashboard
- View portfolio statistics and market trends
- Track environmental impact (CO₂ offset)
- Monitor recent transactions
- Access quick actions for credits management

### Credit Management
- Browse and search credit portfolio
- Filter by status, origin, price range
- Transfer credits to other users
- View detailed credit information
- Track verification status

### Audit Portal (Regulatory Access)
- Review all platform transactions
- Verify credit authenticity
- Export compliance reports
- Manage regulatory approvals
- Track audit trails

## 🔮 Future Enhancements

### Planned Features
- [ ] Mobile application (React Native)
- [ ] Advanced market trading interface
- [ ] Multi-chain blockchain support
- [ ] AI-powered fraud detection
- [ ] Real-time price notifications
- [ ] Integration with external carbon registries
- [ ] Advanced analytics and reporting
- [ ] Automated compliance checking

### Integration Roadmap
- [ ] MetaMask wallet integration
- [ ] IPFS for document storage
- [ ] Oracle integration for real-time pricing
- [ ] Multi-signature transaction support
- [ ] Cross-chain bridge functionality

## 🛡️ Security Features

- JWT-based authentication with secure token handling
- CORS protection for API endpoints
- Input validation and sanitization
- Role-based access control
- Blockchain transaction verification
- Audit logging for compliance

## 🧪 Testing

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

## 📝 API Documentation

The platform provides comprehensive API documentation accessible at `/api/docs/` when the backend is running. This includes:

- Authentication endpoints
- Credit management operations
- Dashboard data endpoints
- Blockchain integration APIs
- Audit and compliance endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: Full-stack implementation with React, Django, and Solidity
- **Architecture**: Microservices design with blockchain integration
- **Security**: JWT authentication and smart contract auditing
- **UI/UX**: Modern component-based interface with responsive design

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Review the API documentation
- Check the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**Backend Server Issues**
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Run database migrations: `python manage.py migrate`
- Check for port conflicts on port 8000

**Frontend Build Issues**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility (18+)
- Verify API connection to backend

**Blockchain Connection Issues**
- Ensure Hardhat node is running: `npx hardhat node`
- Verify contract deployment and address configuration
- Check Web3 provider connection

---

## 🎯 Production Deployment

For production deployment, consider:

1. **Backend**: Use PostgreSQL database and configure proper environment variables
2. **Frontend**: Build optimized bundle with `npm run build`
3. **Blockchain**: Deploy to Ethereum mainnet or Layer 2 solutions
4. **Security**: Implement proper SSL certificates and security headers
5. **Monitoring**: Set up logging and monitoring solutions

---

*H2Ledger - Powering the future of green hydrogen credit trading* 🌱⚡
