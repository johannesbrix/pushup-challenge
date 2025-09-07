import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return ( 
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md mx-auto pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Hello World!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Welcome to Pushup Challenge App 🚀</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}