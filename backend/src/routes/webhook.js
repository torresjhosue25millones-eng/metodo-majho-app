const express = require('express');
const router = express.Router();

const HOTMART_TOKEN = process.env.HOTMART_WEBHOOK_TOKEN;

router.post('/hotmart', async (req, res) => {
  try {
    // 1. Verificar token de seguridad
    const token = req.headers['x-hotmart-hottok'];
    if (HOTMART_TOKEN && token !== HOTMART_TOKEN) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { event, data } = req.body;
    const buyerEmail = data?.buyer?.email;
    const buyerName = data?.buyer?.name;

    console.log(`📩 Webhook Hotmart recibido: ${event} - ${buyerEmail}`);

    // 2. Compra aprobada → activar acceso
    if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE') {
      // Aquí activamos el usuario en la base de datos
      console.log(`✅ Acceso activado para: ${buyerEmail}`);
      // TODO: crear cuenta si no existe
    }

    // 3. Suscripción cancelada → revocar acceso
    if (event === 'SUBSCRIPTION_CANCELLATION') {
      console.log(`❌ Acceso revocado para: ${buyerEmail}`);
      // TODO: desactivar cuenta
    }

    // 4. Pago recurrente → mantener acceso
    if (event === 'PURCHASE_APPROVED' && data?.subscription) {
      console.log(`🔄 Pago recurrente procesado para: ${buyerEmail}`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error en webhook:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
