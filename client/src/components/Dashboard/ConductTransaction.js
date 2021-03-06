import React, { Component } from 'react'
import { Form, FormGroup, FormLabel, FormControl, Button, Row, Col } from 'react-bootstrap'
import io from 'socket.io-client'
import { transactionAPI } from '../../services'

class ConductTransaction extends Component {
  state = { recipient: '', amount: 0, knownAddresses: [] };

  fetchAddresses () {
    transactionAPI.fetchKnownAddresses()
      .then(json => this.setState({ knownAddresses: json }))
      .catch(err => alert(err.message))
  }

  componentDidMount () {
    this.socket = io()
    this.socket.on('newAddress', () => {
      this.fetchAddresses()
    })
    this.fetchAddresses()
  }

  componentWillUnmount () {
    this.socket.close()
  }

  updateRecipient = event => {
    this.setState({ recipient: event.target.value })
  }

  updateAmount = event => {
    if (!Number.isNaN()) {
      this.setState({ amount: Number(event.target.value) || 0 })
    }
  }

  conductTransaction = () => {
    const { recipient, amount } = this.state
    transactionAPI.fetchConductTransaction({ recipient, amount })
      .then(json => {
        alert(json.message || json.type)
        if (json.type === 'success') {
          this.props.history.push('/transaction-pool')
        }
      })
      .catch(err => alert(err.message))
  }

  render () {
    return (
      <Row>
        <Col className='KnownAddresses'>
          <h4>Known Addresses</h4>
          <ul>
            {
              this.state.knownAddresses.map(address =>
                <li key={address[0]}>
                  <p>{address[1]} - {address[0]}</p>
                </li>
              )
            }
          </ul>
        </Col>
        <Col className='ConductTransaction'>
          <h3>Conduct a Transaction</h3>
          <Form>
            <FormGroup>
              <FormLabel>Recipient</FormLabel>
              <FormControl
                input='text'
                placeholder='recipient'
                value={this.state.recipient}
                onChange={this.updateRecipient}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Amount</FormLabel>
              <FormControl
                input='number' placeholder='amount'
                value={this.state.amount}
                onChange={this.updateAmount}
              />
            </FormGroup>
            <Button
              variant='danger'
              size='sm'
              onClick={this.conductTransaction}
            >Submit</Button>
          </Form>
        </Col>
      </Row>
    )
  }
}

export default ConductTransaction
