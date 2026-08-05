import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, Wallet } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isLoggedIn = false // سيتم تغييره لاحقاً مع حالة المصادقة

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 0'
        }}>
          {/* Logo */}
          <Link to="/" style={{ fontSize: '24px', fontWeight: '800' }}>
            <span className="gradient-text">المتجر</span>
            <span style={{ color: 'var(--text-primary)' }}> الرقمي</span>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }} className="desktop-nav">
            <Link to="/" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>الرئيسية</Link>
            <Link to="/#categories" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>التصنيفات</Link>
            <Link to="/#deals" style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}>العروض</Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Wallet size={18} />
                  <span>محفظتي</span>
                </Link>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <User size={18} />
                  <span>حسابي</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px' }}>تسجيل الدخول</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 16px' }}>حساب جديد</Link>
              </>
            )}
            <Link to="/cart" style={{ position: 'relative', color: 'var(--text-secondary)' }}>
              <ShoppingCart size={22} />
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--accent-primary)',
                color: 'white',
                fontSize: '12px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>0</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ display: 'none', background: 'transparent', color: 'var(--text-primary)' }}
            className="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }} className="mobile-menu">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
          <Link to="/#categories" onClick={() => setIsMenuOpen(false)}>التصنيفات</Link>
          <Link to="/#deals" onClick={() => setIsMenuOpen(false)}>العروض</Link>
          {!isLoggedIn && (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center' }}>حساب جديد</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
