import { supabase } from '../lib/supabase'
import type { RedeApoio } from '../types'

export type { RedeApoio }
export type LocalApoio = RedeApoio

export async function getLocaisApoio(): Promise<RedeApoio[]> {
  const { data, error } = await supabase
    .database.from('rede_apoio')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) {
    return getMockRedeApoio()
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    telefone: r.telefone,
    endereco: r.endereco,
    latitude: r.latitude,
    longitude: r.longitude,
    cidade: r.cidade,
    uf: r.uf,
    horario: r.horario
  }))
}

export const getRedeApoio = getLocaisApoio

function getMockRedeApoio(): RedeApoio[] {
  return [
    {
      id: '1',
      nome: 'Delegacia Especializada de Atendimento à Mulher - DDM',
      tipo: 'delegacia',
      telefone: '(67) 3314-1000',
      endereco: 'Rua Marechal Deodoro, 615 - Centro, Campo Grande - MS',
      latitude: -20.4697,
      longitude: -54.6201,
      cidade: 'Campo Grande',
      uf: 'MS',
      horario: 'Seg a Sex 08:00-17:00 | Sáb 08:00-12:00'
    },
    {
      id: '2',
      nome: 'Casa da Mulher Brasileira',
      tipo: 'abrigo',
      telefone: '(67) 3314-2000',
      endereco: 'Av. Afonso Pena, 1500 - Vila Nova, Campo Grande - MS',
      latitude: -20.4650,
      longitude: -54.6150,
      cidade: 'Campo Grande',
      uf: 'MS',
      horario: '24 horas'
    },
    {
      id: '3',
      nome: 'Núcleo de Atendimento à Mulher - CAMI',
      tipo: 'ong',
      telefone: '(67) 3314-3000',
      endereco: 'Rua das Flores, 250 - Jardim dos Estados, Campo Grande - MS',
      latitude: -20.4700,
      longitude: -54.6250,
      cidade: 'Campo Grande',
      uf: 'MS',
      horario: 'Seg a Sex 08:00-18:00'
    },
    {
      id: '4',
      nome: 'Delegacia de Polícia Civil - Dourados',
      tipo: 'delegacia',
      telefone: '(67) 3421-1000',
      endereco: 'Rua Barão do Rio Branco, 870 - Centro, Dourados - MS',
      latitude: -22.2697,
      longitude: -54.8081,
      cidade: 'Dourados',
      uf: 'MS',
      horario: '24 horas'
    },
    {
      id: '5',
      nome: 'Centro de Referência da Mulher - Três Lagoas',
      tipo: 'ong',
      telefone: '(67) 3422-4000',
      endereco: 'Av. Brasil, 3500 - Jardim Ipê, Três Lagoas - MS',
      latitude: -20.7528,
      longitude: -51.6758,
      cidade: 'Três Lagoas',
      uf: 'MS',
      horario: 'Seg a Sex 08:00-17:00'
    },
    {
      id: '6',
      nome: 'Hospital Municipal São Francisco',
      tipo: 'hospital',
      telefone: '(67) 3423-5000',
      endereco: 'Rua Frei Mariano, 150 - Centro, Corumbá - MS',
      latitude: -19.0159,
      longitude: -57.6537,
      cidade: 'Corumbá',
      uf: 'MS',
      horario: '24 horas'
    }
  ]
}

export async function adicionarLocalApoio(rede: RedeApoio): Promise<{ error?: string }> {
  const { error } = await supabase
    .database.from('rede_apoio')
    .insert([{
      id: rede.id,
      nome: rede.nome,
      tipo: rede.tipo,
      telefone: rede.telefone,
      endereco: rede.endereco,
      latitude: rede.latitude,
      longitude: rede.longitude,
      cidade: rede.cidade,
      uf: rede.uf,
      horario: rede.horario,
      ativo: true
    }])

  if (error) {
    return { error: 'Erro ao salvar local de apoio' }
  }
  return {}
}

export async function atualizarLocalApoio(id: string, updates: Partial<RedeApoio>): Promise<{ error?: string }> {
  const { error } = await supabase
    .database.from('rede_apoio')
    .update(updates)
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao atualizar local de apoio' }
  }
  return {}
}

export async function removerLocalApoio(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .database.from('rede_apoio')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao remover local de apoio' }
  }
  return {}
}
