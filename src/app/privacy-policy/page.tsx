'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Database, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-xl font-bold">นโยบายความเป็นส่วนตัว</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-6 h-6 text-blue-500" />
              Privacy Policy / นโยบายความเป็นส่วนตัว
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: January 19, 2026
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Introduction
              </h2>
              <p className="text-muted-foreground">
                {`This Privacy Policy describes how Spin FB Giveaway ("we", "us", or "our") 
                collects, uses, and shares information when you use our Facebook giveaway 
                management application ("the App").`}
              </p>
              <p className="text-muted-foreground">
                นโยบายความเป็นส่วนตัวนี้อธิบายวิธีที่ Spin FB Giveaway เก็บรวบรวม ใช้ 
                และแบ่งปันข้อมูลเมื่อคุณใช้แอปพลิเคชันจัดการแจกรางวัลบน Facebook ของเรา
              </p>
            </section>

            {/* Data We Collect */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data We Collect / ข้อมูลที่เราเก็บรวบรวม
              </h2>
              <p className="text-muted-foreground mb-4">
                When you use our App, we may collect the following information from Facebook:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Facebook Page Information:</strong> Page ID, Page name, and Page access token 
                  (ข้อมูลเพจ: ID เพจ ชื่อเพจ และ token การเข้าถึง)
                </li>
                <li>
                  <strong>Post Comments:</strong> Comment ID, comment text, commenter public name and ID 
                  (if available based on user privacy settings)
                  (ความคิดเห็นในโพสต์: ID ความเห็น ข้อความ ชื่อและ ID ของผู้แสดงความคิดเห็น)
                </li>
                <li>
                  <strong>Comment Timestamps:</strong> When comments were posted
                  (เวลาที่โพสต์ความคิดเห็น)
                </li>
              </ul>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-xl font-semibold">How We Use Your Data / วิธีที่เราใช้ข้อมูล</h2>
              <p className="text-muted-foreground mb-4">We use the collected data to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Display and manage giveaway participants (แสดงและจัดการผู้เข้าร่วมกิจกรรม)</li>
                <li>Validate participation requirements (ตรวจสอบเงื่อนไขการเข้าร่วม)</li>
                <li>Randomly select winners (สุ่มเลือกผู้โชคดี)</li>
                <li>Generate exportable participant lists (สร้างรายชื่อผู้เข้าร่วมสำหรับ export)</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="text-xl font-semibold">Data Storage / การจัดเก็บข้อมูล</h2>
              <p className="text-muted-foreground">
                <strong>All data is stored locally in your browser</strong> using localStorage. 
                We do not store any data on external servers. Your data remains on your device only.
              </p>
              <p className="text-muted-foreground">
                <strong>ข้อมูลทั้งหมดถูกจัดเก็บในเบราว์เซอร์ของคุณ</strong> โดยใช้ localStorage 
                เราไม่จัดเก็บข้อมูลใดๆ บนเซิร์ฟเวอร์ภายนอก ข้อมูลของคุณอยู่บนอุปกรณ์ของคุณเท่านั้น
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold">Data Sharing / การแบ่งปันข้อมูล</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or share your data with third parties. 
                The only data transfer occurs between your browser and Facebook API 
                when fetching comments.
              </p>
              <p className="text-muted-foreground">
                เราไม่ขาย ไม่แลกเปลี่ยน และไม่แบ่งปันข้อมูลของคุณกับบุคคลที่สาม 
                การถ่ายโอนข้อมูลเกิดขึ้นระหว่างเบราว์เซอร์ของคุณกับ Facebook API เท่านั้น
              </p>
            </section>

            {/* Data Deletion */}
            <section>
              <h2 className="text-xl font-semibold">Data Deletion / การลบข้อมูล</h2>
              <p className="text-muted-foreground">
                {`You can delete all stored data at any time through the Settings page 
                (Clear All Data button) or by clearing your browser localStorage.`}
              </p>
              <p className="text-muted-foreground">
                คุณสามารถลบข้อมูลที่จัดเก็บทั้งหมดได้ตลอดเวลาผ่านหน้าตั้งค่า 
                (ปุ่มล้างข้อมูลทั้งหมด) หรือโดยการล้าง localStorage ของเบราว์เซอร์
              </p>
              <p className="text-muted-foreground mt-2">
                For detailed data deletion instructions, please visit our{' '}
                <Link href="/data-deletion" className="text-blue-400 hover:underline">
                  Data Deletion page
                </Link>.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Us / ติดต่อเรา
              </h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground">
                <strong>Email:</strong> support@spinfb.app
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-semibold">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                {`We may update this Privacy Policy from time to time. We will notify you 
                of any changes by posting the new Privacy Policy on this page and updating 
                the "Last updated" date.`}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
