interface GeocodingResult {
  lat: number
  lng: number
  bairro?: string
  cidade?: string
  uf?: string
  enderecoCompleto?: string
}

export async function geocodificarEndereco(endereco: string): Promise<GeocodingResult | null> {
  if (!endereco || endereco.trim().length < 5) return null

  try {
    const query = encodeURIComponent(endereco)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=br`,
      {
        headers: {
          'User-Agent': 'ProtegidaApp/1.0 (projeto_protegida)'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (!data || data.length === 0) return null

    const result = data[0]
    const address = result.address || {}

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      bairro: address.suburb || address.neighbourhood || address.quarter || undefined,
      cidade: address.city || address.town || address.village || undefined,
      uf: address.state || undefined,
      enderecoCompleto: result.display_name || undefined
    }
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error)
    return null
  }
}

export async function geocodificarEnderecoComCoords(
  endereco: string,
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  const resultado = await geocodificarEndereco(endereco)
  if (resultado) return resultado

  return { lat, lng }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ProtegidaApp/1.0 (projeto_protegida)'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (!data) return null

    const address = data.address || {}

    return {
      lat,
      lng,
      bairro: address.suburb || address.neighbourhood || address.quarter || undefined,
      cidade: address.city || address.town || address.village || undefined,
      uf: address.state || undefined,
      enderecoCompleto: data.display_name || undefined
    }
  } catch (error) {
    console.error('Erro no reverse geocode:', error)
    return null
  }
}
