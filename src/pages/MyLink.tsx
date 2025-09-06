import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyLink() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>마이링크</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">링크 관리 기능이 곧 출시됩니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}