import { getTestSelector } from '../utils'

const DOWNLOAD_APP_MODAL_TITLE = 'Get started with Uniswap'

describe('Landing Page', () => {
  it('shows landing page when no user state exists', () => {
    cy.visit('/', { eagerlyConnect: false })
    cy.get(getTestSelector('landing-page'))
    cy.screenshot()
  })

  it('shows landing page when a user has already connected a wallet but ?intro=true is in query', () => {
    cy.visit('/?intro=true')
    cy.get(getTestSelector('landing-page'))
  })

  it('remains on landing page when account drawer is opened and only redirects after user becomes connected', () => {
    // Visit landing page with no connection or recent connection, and open account drawer
    cy.visit('/', { eagerlyConnect: false })
    cy.get(getTestSelector('navbar-connect-wallet')).contains('Connect').click()
    cy.url().should('not.include', '/swap')

    // Connect and verify redirect
    cy.contains('MetaMask').click()
    cy.hardhat().then((hardhat) => cy.contains(hardhat.wallet.address.substring(0, 6)))
    cy.url().should('include', '/swap')
  })

  it('allows navigation to pool', () => {
    cy.viewport(2000, 1600)
    cy.visit('/swap')
    cy.get(getTestSelector('Pool-tab')).first().click()
    cy.url().should('include', '/pool')
  })

  it('allows navigation to pool on mobile', () => {
    cy.viewport('iphone-6')
    cy.visit('/swap')
    cy.get(getTestSelector('nav-company-menu')).should('be.visible').click()
    cy.get(getTestSelector('company-menu-mobile-drawer')).should('be.visible').within(() => {
      cy.contains('Pool').should('be.visible').click()
      cy.url().should('include', '/pool')
    })
  })

  it('does not render landing page when / path is blocked', () => {
    cy.intercept('/', (req) => {
      req.reply((res) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(res.body, 'text/html')
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'x:blocked-paths')
        meta.setAttribute('content', '/,/buy')
        doc.head.appendChild(meta)

        res.body = doc.documentElement.outerHTML
      })
    })
    cy.visit('/', { eagerlyConnect: false })

    cy.get(getTestSelector('landing-page')).should('not.exist')
    cy.get(getTestSelector('buy-fiat-button')).should('not.exist')
    cy.url().should('include', '/swap')
  })

  it('does not render uk compliance banner in US', () => {
    cy.visit('/swap')
    cy.contains('UK disclaimer').should('not.exist')
  })

  it('renders uk compliance banner in uk', () => {
    cy.intercept(/(?:interface|beta).gateway.uniswap.org\/v1\/amplitude-proxy/, (req) => {
      const requestBody = JSON.stringify(req.body)
      const byteSize = new Blob([requestBody]).size
      req.alias = 'amplitude'
      req.reply(
        JSON.stringify({
          code: 200,
          server_upload_time: Date.now(),
          payload_size_bytes: byteSize,
          events_ingested: req.body.events.length,
        }),
        {
          'origin-country': 'GB',
        }
      )
    })
    cy.visit('/swap')
    cy.contains('Read more').click()
    cy.contains('Disclaimer for UK residents')
  })

  it('shows a nav button to download the app when feature is enabled', () => {
    cy.visit('/?intro=true')
    cy.get('nav').within(() => {
      cy.contains('Get the app').should('be.visible')
    })
    cy.visit('/swap')
    cy.get('nav').within(() => {
      cy.contains('Get the app').should('not.exist')
    })
  })

  it('hides call to action text on small screen sizes', () => {
    cy.viewport('iphone-8')
    cy.visit('/?intro=true')
    cy.contains('Get the app').should('not.exist')
  })

  it('opens modal when Get-the-App button is selected', () => {
    cy.visit('/?intro=true')
    cy.get('nav').within(() => {
      cy.contains('Get the app').should('exist').click()
    })
    cy.contains(DOWNLOAD_APP_MODAL_TITLE).should('exist')
  })

  it('closes modal when close button is selected', () => {
    cy.visit('/?intro=true')
    cy.get('nav').within(() => {
      cy.contains('Get the app').should('exist').click()
    })
    cy.contains(DOWNLOAD_APP_MODAL_TITLE).should('exist')
    cy.get(getTestSelector('get-the-app-close-button')).click()
    cy.contains(DOWNLOAD_APP_MODAL_TITLE).should('not.exist')
  })

  it('closes modal when user selects area outside of modal', () => {
    cy.visit('/?intro=true')
    cy.get('nav').within(() => {
      cy.contains('Get the app').should('exist').click()
    })
    cy.contains(DOWNLOAD_APP_MODAL_TITLE).should('exist')
    cy.get('nav').click({ force: true })
    cy.contains(DOWNLOAD_APP_MODAL_TITLE).should('not.exist')
  })
})
