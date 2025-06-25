"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const textSchema = z.object({
  text: z.string().min(1, "텍스트를 입력해주세요"),
});

type TextFormData = z.infer<typeof textSchema>;

interface TextFormProps {
  value: string;
  onChange: (text: string) => void;
}

export function TextForm({ value, onChange }: TextFormProps) {
  const form = useForm<TextFormData>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      text: value || "",
    },
    mode: "onChange",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>일반 텍스트</CardTitle>
        <CardDescription>
          공유하고 싶은 텍스트를 자유롭게 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>텍스트</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="여기에 텍스트를 입력하세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
    </Card>
  );
}
