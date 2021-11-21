import React from 'react'
import styled from 'styled-components'
import cloneDeep from 'lodash/cloneDeep'
import {
  Container,
  Form,
  Row,
  Col,
  Button
} from 'react-bootstrap'

import { setLocalData, getLocalData } from '../utils/storage'
import callNotion from '../utils/notion'
import { NOTION_SHIPMENTS_DB_ID } from '../constants'
import { addressFactory } from '../factories'
import useForm from '../hooks/useForm'
import HeaderNav from '../components/Nav'
import Address from '../components/Address'
import Parcels from '../components/Parcels'
import RateParcels from '../components/RateParcels'
import Rates from '../components/Rates'
import PurchasedRate from '../components/PurchasedRate'

function Home () {
  const [rateParcels, setRateParcels] = React.useState(getLocalData('rateParcels') || [])
  const [rates, setRates] = React.useState(getLocalData('rates') || [])
  const [purchasedRate, setPurchasedRate] = React.useState(getLocalData('purchasedRate') || null)
  const {
    input,
    isLoading,
    handleChange,
    handleSubmit
  } = useForm({
    resource: 'shipment',
    action: 'create',
    defaultInput: {
      addressFrom: getLocalData('addressFrom') || addressFactory(),
      addressTo: getLocalData('addressTo') || addressFactory(),
      parcels: getLocalData('parcels') || []
    },
    massageInput: (input) => {
      const massaged = cloneDeep(input)
      massaged.parcels.forEach((parcel, i) => {
        const qty = parcel.quantity
        delete parcel.id
        delete parcel.quantity

        if (qty > 1) {
          const copies = []
          for (let j = 1; j < qty; j++) {
            copies.push(Object.assign({}, parcel))
          }
          massaged.parcels.splice(i, 0, ...copies)
        }
      })
      return massaged
    },
    afterChange: (newInput) => {
      setLocalData('addressFrom', newInput.addressFrom)
      setLocalData('addressTo', newInput.addressTo)
      setLocalData('parcels', newInput.parcels)
    },
    afterSubmit: setRateData
  })

  function getNotionShipments () {
    const path = `databases/${NOTION_SHIPMENTS_DB_ID}/query`
    callNotion(path, 'POST')
  }

  function setRateData (data) {
    setLocalData('rateParcels', data.parcels)
    setLocalData('rates', data.rates)
    setRateParcels(data.parcels)
    setRates(data.rates)
  }

  function _setPurchasedRate (rate) {
    setLocalData('purchasedRate', rate)
    setPurchasedRate(rate)
  }

  return (
    <>
      <HeaderNav
        isLoading={isLoading}
        setRateData={setRateData}
        setPurchasedRate={_setPurchasedRate}
        handleSubmit={handleSubmit}
      />

      <Container fluid>
        <Row className='pt-5'>
          <ColWithBg xs={12} sm={6} className='pb-5 pt-5'>

            <Button className='mb-3' onClick={getNotionShipments}>Populate from Notion Shipment</Button>

            <Form>
              <Address
                address={input.addressFrom}
                name='addressFrom'
                handleChange={handleChange}
              />

              <Address
                address={input.addressTo}
                name='addressTo'
                handleChange={handleChange}
              />

              <Parcels
                parcels={input.parcels}
                handleChange={handleChange}
              />
            </Form>
          </ColWithBg>

          <Col xs={12} sm={6} className='pt-5'>
            <PurchasedRate rate={purchasedRate} />
            <Rates
              rates={rates}
              setPurchasedRate={_setPurchasedRate}
            />
            <RateParcels parcels={rateParcels} />
          </Col>
        </Row>
      </Container>
    </>
  )
}

const ColWithBg = styled(Col)`
  background-color: #eaeaea;
  border-right: 1px solid #d5d5d5;
`

export default Home
