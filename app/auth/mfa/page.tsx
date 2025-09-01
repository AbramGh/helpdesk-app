"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Smartphone, Key, Copy, CheckCircle } from "lucide-react"

export default function MFASetupPage() {
  const [step, setStep] = useState<"setup" | "verify" | "recovery">("setup")
  const [qrCode] = useState("otpauth://totp/Helpdesk:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Helpdesk")
  const [verificationCode, setVerificationCode] = useState("")
  const [recoveryCodes] = useState([
    "a1b2c3d4",
    "e5f6g7h8",
    "i9j0k1l2",
    "m3n4o5p6",
    "q7r8s9t0",
    "u1v2w3x4",
    "y5z6a7b8",
    "c9d0e1f2",
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement MFA verification API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("recovery")
    } catch (err) {
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"))
  }

  if (step === "recovery") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Save your recovery codes</CardTitle>
            <CardDescription>
              Store these codes in a safe place. You can use them to access your account if you lose your authenticator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-background rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={copyRecoveryCodes}>
              <Copy className="mr-2 h-4 w-4" />
              Copy codes
            </Button>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Each recovery code can only be used once. Make sure to store them securely.
              </AlertDescription>
            </Alert>

            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Verify your authenticator</CardTitle>
            <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-lg font-mono tracking-widest"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setStep("setup")}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || verificationCode.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Set up two-factor authentication</CardTitle>
          <CardDescription>Secure your account with an authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Step 1: Install an authenticator app</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download an app like Google Authenticator, Authy, or 1Password.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">Google Authenticator</Badge>
                <Badge variant="secondary">Authy</Badge>
                <Badge variant="secondary">1Password</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Step 2: Scan the QR code</h3>
              <div className="bg-white p-4 rounded-lg border inline-block">
                <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Can't scan? Enter this code manually: <code className="bg-muted px-1 rounded">JBSWY3DPEHPK3PXP</code>
              </p>
            </div>
          </div>

          <Button className="w-full" onClick={() => setStep("verify")}>
            <Smartphone className="mr-2 h-4 w-4" />
            I've added the account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
