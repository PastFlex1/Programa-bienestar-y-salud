
import { getSession } from "@/lib/firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function JournalPage() {
    const session = await getSession();
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to your Journal, {session?.name || 'User'}</CardTitle>
                        <CardDescription>
                            Today is {today}. Take a moment to reflect.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="What's on your mind?"
                            rows={10}
                            className="resize-none"
                        />
                        <Button>Save Entry</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
