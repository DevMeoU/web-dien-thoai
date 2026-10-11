import { PAYMENT_METHODS, PAYMENT_STATUS } from './orderStatus'

function Block({ title, children }) {
  return <div className="flex flex-col gap-1.5">
    <h3 className="font-medium">{title}</h3>
    <div className="text-sm leading-[1.6] text-[#555]">{children}</div>
  </div>
}

export default function OrderInfoBlocks({ order }) {
  const { recipient, shipping_address: address } = order
  return <div className="grid gap-6 tablet:grid-cols-2">
    <Block title="Người nhận">
      <p>{recipient.name}</p><p>{recipient.phone}</p>{recipient.email && <p>{recipient.email}</p>}
    </Block>
    <Block title="Địa chỉ giao hàng">
      <p>{address.line}</p><p>{address.ward}, {address.district}</p><p>{address.city}</p>
    </Block>
    <Block title="Thanh toán"><p>{PAYMENT_METHODS[order.payment_method] ?? order.payment_method}</p><p>{PAYMENT_STATUS[order.payment_status] ?? order.payment_status}</p></Block>
    {order.note && <Block title="Ghi chú"><p>{order.note}</p></Block>}
    {order.cancel_reason && <Block title="Lý do hủy"><p>{order.cancel_reason}</p></Block>}
  </div>
}
