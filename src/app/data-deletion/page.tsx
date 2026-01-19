'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Trash2, Settings, HardDrive, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </Link>
          <h1 className="text-xl font-bold">คำแนะนำการลบข้อมูล</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trash2 className="w-6 h-6 text-red-500" />
              Data Deletion Instructions / คำแนะนำการลบข้อมูล
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              How to delete your data from Spin FB Giveaway
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Important Notice */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-400">Important: Local Storage Only</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Spin FB Giveaway stores all data locally in your browser. 
                    <strong> We do not store any of your data on our servers.</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Spin FB Giveaway จัดเก็บข้อมูลทั้งหมดในเบราว์เซอร์ของคุณ 
                    <strong> เราไม่ได้จัดเก็บข้อมูลใดๆ ของคุณบนเซิร์ฟเวอร์ของเรา</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Method 1: In-App */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                Method 1: Delete from Settings Page
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Open the App and go to Settings</p>
                    <p className="text-sm text-muted-foreground">
                      เปิดแอปและไปที่หน้าตั้งค่า (เมนู ⚙️ ตั้งค่า)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Find the "Danger Zone" section</p>
                    <p className="text-sm text-muted-foreground">
                      หาส่วน "Danger Zone" ที่ด้านล่างของหน้า
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Click "ล้างข้อมูลทั้งหมด" (Clear All Data)</p>
                    <p className="text-sm text-muted-foreground">
                      คลิกปุ่ม "ล้างข้อมูลทั้งหมด" และยืนยัน
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-green-400">All participant data and draw history will be deleted</p>
                    <p className="text-sm text-muted-foreground">
                      ข้อมูลผู้เข้าร่วมและประวัติการสุ่มทั้งหมดจะถูกลบ
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Method 2: Browser */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
                Method 2: Clear Browser Data
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You can also clear all data by clearing your browser's localStorage:
                </p>
                
                <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <h4 className="font-medium">For Chrome / Chromium browsers:</h4>
                  <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Open Developer Tools (F12 or Ctrl+Shift+I)</li>
                    <li>Go to "Application" tab</li>
                    <li>In the left sidebar, expand "Local Storage"</li>
                    <li>Right-click on the site and select "Clear"</li>
                  </ol>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <h4 className="font-medium">For Firefox:</h4>
                  <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
                    <li>Open Developer Tools (F12 or Ctrl+Shift+I)</li>
                    <li>Go to "Storage" tab</li>
                    <li>Expand "Local Storage"</li>
                    <li>Right-click and select "Delete All"</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* What Data is Deleted */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                What Data is Deleted / ข้อมูลที่ถูกลบ
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>All imported participant data (ข้อมูลผู้เข้าร่วมที่นำเข้าทั้งหมด)</li>
                <li>All draw history and results (ประวัติการสุ่มและผลลัพธ์ทั้งหมด)</li>
                <li>App configuration settings (การตั้งค่าแอป)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Note:</strong> Your Facebook access tokens are NOT stored by us. 
                They are only used temporarily during your session.
              </p>
            </section>

            {/* Facebook App Removal */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Revoke App Access on Facebook
              </h2>
              <p className="text-muted-foreground mb-4">
                To completely remove the app's access to your Facebook account:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Go to Facebook Settings → Apps and Websites</li>
                <li>Find "Spin FB Giveaway"</li>
                <li>Click "Remove" to revoke all permissions</li>
              </ol>
              <a 
                href="https://www.facebook.com/settings?tab=applications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4"
              >
                <Button variant="outline">
                  Go to Facebook App Settings →
                </Button>
              </a>
            </section>

            {/* Contact */}
            <section className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">
                Need Help? / ต้องการความช่วยเหลือ?
              </h2>
              <p className="text-muted-foreground">
                If you have any questions about deleting your data, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> support@spinfb.app
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
