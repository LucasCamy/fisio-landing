import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TriageFlow } from './TriageModal'

describe('<TriageFlow />', () => {
  it('pede uma opção antes de avançar', async () => {
    const user = userEvent.setup()
    render(<TriageFlow />)
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma opção')
    expect(screen.getByText(/Passo 1 de 3/)).toBeInTheDocument()
  })

  it('percorre os 3 passos e monta o link do WhatsApp com o resumo', async () => {
    const user = userEvent.setup()
    render(<TriageFlow />)

    await user.click(screen.getByLabelText('Joelho'))
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    await user.click(screen.getByLabelText('Estou em pós-operatório'))
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    await user.click(screen.getByLabelText('Recuperar bem após a cirurgia'))
    await user.click(screen.getByRole('button', { name: /ver resumo/i }))

    const summary = screen.getByTestId('triage-summary')
    expect(summary).toHaveTextContent('Joelho')
    expect(summary).toHaveTextContent('Estou em pós-operatório')

    const link = screen.getByTestId('triage-whatsapp')
    const url = new URL(link.getAttribute('href')!)
    expect(url.origin).toBe('https://wa.me')
    expect(url.searchParams.get('text')).toContain('• Região da queixa: Joelho')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText(/Nada é salvo neste site/)).toBeInTheDocument()
  })

  it('permite voltar e trocar a resposta mantendo as anteriores', async () => {
    const user = userEvent.setup()
    render(<TriageFlow />)
    await user.click(screen.getByLabelText('Ombro'))
    await user.click(screen.getByRole('button', { name: /continuar/i }))
    await user.click(screen.getByRole('button', { name: /voltar/i }))
    expect(screen.getByLabelText('Ombro')).toBeChecked()
  })
})
