import React from 'react'
import { Card, Button } from 'react-bootstrap'

import shippo from '../utils/shippo'
import { purchasedRateMask, purchasedRateLinkMask } from '../utils/dataMasks'
import DataList from './DataList'
import ButtonSpinner from './ButtonSpinner'
import { PDF_MERGER_API_URL } from '../constants'

function PurchasedRate ({ rate }) {
  const [results, setResults] = React.useState(null)
  const [isLoadingMergedLabels, setIsLoadingMergedLabels] = React.useState(false)

  React.useEffect(() => {
    async function getLabels () {
      try {
        const res = await shippo('transaction', 'list', {
          rate: rate?.rate,
          results: 50
        })
        setResults(res.results)
      } catch (err) {
        console.warn(err)
      }
    }

    getLabels()
  }, [rate])

  async function getMergedLabels () {
    setIsLoadingMergedLabels(true)
    const res = await fetch(PDF_MERGER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pdf_urls: results.map(result => result.labelUrl).reverse()
      })
    })
    const base64Pdf = await res.text()
    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${base64Pdf}`
    link.download = 'postage.pdf'
    link.click()
    setIsLoadingMergedLabels(false)
  }

  if (!rate) return null

  return (
    <>
      <h3>Purchased Rate</h3>

      <Card className='mb-4'>
        <Card.Body>
          <h4>Master Label</h4>
          <DataList
            obj={rate}
            mask={purchasedRateMask}
            linkMask={purchasedRateLinkMask}
          />

          {results && results.length > 0 && (
            <>
              <div className='mt-4'>
                <h4>All Tracking Numbers</h4>
                {results.map(result => result.trackingNumber).reduce((prev, tn) => prev + ', ' + tn)}
              </div>

              <div className='mt-4'>
                <h4>Merged Labels</h4>
                <Button
                  disabled={isLoadingMergedLabels}
                  onClick={getMergedLabels}
                >
                  {isLoadingMergedLabels && <ButtonSpinner />}
                  Download merged labels PDF
                </Button>
              </div>

              <div className='mt-4'>
                <h4>All Labels</h4>
                {results.map(result => {
                  return (
                    <DataList
                      key={result.objectId}
                      obj={result}
                      mask={purchasedRateMask}
                      linkMask={purchasedRateLinkMask}
                    />
                  )
                })}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default PurchasedRate
