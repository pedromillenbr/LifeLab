'use client'

interface CreditCardProps {
  name?: string
  last4?: string
  expiry?: string
}

export function CreditCard({ name = 'Pedro', last4 = '4291', expiry = '12/27' }: CreditCardProps) {
  return (
    <div className="credit-card">
      <div className="cc-top">
        <div className="cc-chip" />
        <div className="cc-circles">
          <div className="cc-circle-1" />
          <div className="cc-circle-2" />
        </div>
      </div>
      <div className="cc-number">•••• •••• •••• {last4}</div>
      <div className="cc-bottom">
        <span className="cc-name">{name}</span>
        <span className="cc-expiry">{expiry}</span>
      </div>
    </div>
  )
}
