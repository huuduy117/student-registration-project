"use client"

import { useState, useEffect } from "react"
import "../assets/SimpleCaptcha.css"

const SimpleCaptcha = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")

  // Generate a simple math captcha
  const generateCaptcha = () => {
    const operations = ["+", "-", "*"]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let num1, num2, result

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        result = num1 + num2
        break
      case "-":
        num1 = Math.floor(Math.random() * 10) + 10
        num2 = Math.floor(Math.random() * 9) + 1
        result = num1 - num2
        break
      case "*":
        num1 = Math.floor(Math.random() * 5) + 1
        num2 = Math.floor(Math.random() * 5) + 1
        result = num1 * num2
        break
      default:
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        result = num1 + num2
    }

    const captcha = {
      text: `${num1} ${operation} ${num2} = ?`,
      result: result.toString(),
    }

    setCaptchaText(captcha.text)
    return captcha.result
  }

  const [expectedResult, setExpectedResult] = useState(() => generateCaptcha())

  useEffect(() => {
    // Reset verification when captcha changes
    setIsVerified(false)
    setUserInput("")
    setError("")

    // Notify parent component
    onVerify(false)
  }, [captchaText])

  const handleRefresh = () => {
    setExpectedResult(generateCaptcha())
  }

  const handleInputChange = (e) => {
    setUserInput(e.target.value)
    setError("")
  }

  const handleVerify = () => {
    if (userInput === expectedResult) {
      setIsVerified(true)
      setError("")
      onVerify(true)
    } else {
      setError("Kết quả không chính xác, vui lòng thử lại")
      setIsVerified(false)
      onVerify(false)
      // Generate a new captcha after failed attempt
      handleRefresh()
    }
  }

  return (
    <div className="captcha-container">
      <h3>Xác thực CAPTCHA</h3>
      <div className="captcha-challenge">
        <div className="captcha-text">{captchaText}</div>
        <button type="button" className="refresh-button" onClick={handleRefresh} title="Làm mới CAPTCHA">
          🔄
        </button>
      </div>

      <div className="captcha-input-group">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Nhập kết quả"
          className={`captcha-input ${isVerified ? "verified" : ""}`}
          disabled={isVerified}
        />

        {!isVerified && (
          <button type="button" className="verify-button" onClick={handleVerify} disabled={!userInput}>
            Xác nhận
          </button>
        )}

        {isVerified && <div className="verified-badge">✓ Đã xác thực</div>}
      </div>

      {error && <div className="captcha-error">{error}</div>}
    </div>
  )
}

export default SimpleCaptcha
