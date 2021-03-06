import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Form, FormGroup, FormControl, FormLabel, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { login } from '../../redux/features/auth/authSlice'

const SignIn = () => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Form>
      <FormGroup>
        <FormLabel>Email Address</FormLabel>
        <FormControl
          input='email'
          type='email'
          placeholder='John@protonmail.ch'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <FormLabel>Password</FormLabel>
        <FormControl
          input='password'
          type='password'
          placeholder='Your password here'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </FormGroup>
      <Link to='/signup'>Register</Link>
      <Link to='/forget-password'>Forget password</Link>
      <Button
        variant='danger'
        size='sm'
        onClick={() => dispatch(login({ email, password }))}
      >Submit</Button>
    </Form>
  )
}

export default SignIn
