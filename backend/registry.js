/**
 * Device registry — maps equipment card numbers to fleet bin IDs.
 * Add each physical device here as you deploy it.
 *
 * Equipment card number comes from the device configuration screen.
 */

export const DEVICE_REGISTRY = {
  '26042400P101': { cardNumber: '26042400P101', imei: '867105074732545', binId: 'HS-001', name: 'HS-001'               },
  '26042400P102': { cardNumber: '26042400P102', binId: 'HS-002', name: 'Sliema Promenade'      },
  '26042400P103': { cardNumber: '26042400P103', binId: 'HS-003', name: 'Bugibba Square'        },
  '26042400P104': { cardNumber: '26042400P104', binId: 'HS-004', name: 'Mdina Main Gate'       },
  '26042400P105': { cardNumber: '26042400P105', binId: 'HS-005', name: 'Mosta Rotunda'         },
  '26042400P106': { cardNumber: '26042400P106', binId: 'HS-006', name: 'Marsaxlokk Waterfront' },
  '26042400P107': { cardNumber: '26042400P107', binId: 'HS-007', name: 'Birgu Waterfront'      },
  '26042400P108': { cardNumber: '26042400P108', binId: 'HS-008', name: 'Golden Bay Beach'      },
};

/** Resolve equipment card number or IMEI to registry entry. Returns null if unknown. */
export function resolveDevice(cardOrImei) {
  if (!cardOrImei) return null;
  const id = cardOrImei.trim();
  return (
    Object.values(DEVICE_REGISTRY).find(d => d.cardNumber === id || d.imei === id) ||
    DEVICE_REGISTRY[id] ||
    null
  );
}
