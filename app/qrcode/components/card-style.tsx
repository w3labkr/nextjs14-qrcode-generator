"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";
import { QrcodeFormValues } from "./qrcode-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function CardStyle() {
  const { control, setValue } = useFormContext<QrcodeFormValues>();
  const borderStyle = useWatch({ control, name: "styleBorderStyle" });

  const handleResetStyles = () => {
    setValue("styleForegroundColor", "#000000");
    setValue("styleBackgroundColor", "#ffffff");
    setValue("styleLogo", "");
    setValue("styleBorderStyle", "none");
    setValue("styleText", "");
    setValue("styleBorderColor", "#000000");
    setValue("styleTextColor", "#000000");
    setValue("styleBorderRadius", 16);
    setValue("styleBorderWidth", 2);
    setValue("styleFontSize", 16);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>디자인</CardTitle>
        <CardDescription>
          QR 코드의 디자인을 설정합니다. 프레임 스타일, 안내 문구, 색상 등을
          조정할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <FieldStyleForegroundColor />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <FieldStyleBackgroundColor />
        </div>
        <FieldStyleLogo />
        <FieldStyleBorderStyle />
        {borderStyle === "custom" && (
          <>
            <FieldStyleText />
            <div className="col-span-2 sm:col-span-1">
              <FieldStyleBorderColor />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FieldStyleTextColor />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FieldStyleBorderRadius />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FieldStyleBorderWidth />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FieldStyleFontSize />
            </div>
          </>
        )}
        {borderStyle === "rounded" && (
          <div className="col-span-2 sm:col-span-1">
            <FieldStyleBorderRadius />
          </div>
        )}
        {borderStyle === "simple" && (
          <>
            <div className="col-span-2 sm:col-span-1">
              <FieldStyleBorderColor />
            </div>
          </>
        )}
        {borderStyle === "custom" && (
          <div className="col-span-2 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>사용자 정의 모드:</strong> 모서리 반지름, 테두리 색상과
              굵기, 안내 문구와 색상, 폰트 사이즈를 자유롭게 설정할 수 있습니다.
              다양한 디자인 조합으로 독특한 QR 코드를 만들어보세요.
            </p>
          </div>
        )}
        <div className="col-span-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetStyles}
            className="w-full"
          >
            디자인 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FieldStyleForegroundColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleForegroundColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            전경색 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBackgroundColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBackgroundColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            배경색 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleLogo() {
  const { control, setValue } = useFormContext<QrcodeFormValues>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      // 파일을 base64로 변환
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setValue("styleLogo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormField
      control={control}
      name="styleLogo"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>
            로고 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </FormControl>
          {field.value && (
            <div className="mt-2">
              <img
                src={field.value}
                alt="로고 미리보기"
                className="max-w-16 max-h-16 object-contain border rounded"
              />
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBorderStyle() {
  const { control, setValue } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBorderStyle"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>
            테두리 스타일 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // 테두리 스타일 변경시 즉시 기본값 설정
                switch (value) {
                  case "none":
                    setValue("styleText", "");
                    setValue("styleBorderColor", "#000000");
                    setValue("styleTextColor", "#000000");
                    setValue("styleBorderRadius", 0);
                    setValue("styleBorderWidth", 1);
                    setValue("styleFontSize", 16);
                    break;
                  case "simple":
                    setValue("styleText", "");
                    setValue("styleBorderColor", "#000000");
                    setValue("styleTextColor", "#000000");
                    setValue("styleBorderRadius", 0);
                    setValue("styleBorderWidth", 2);
                    setValue("styleFontSize", 16);
                    break;
                  case "rounded":
                    setValue("styleText", "");
                    setValue("styleBorderColor", "#000000");
                    setValue("styleTextColor", "#000000");
                    setValue("styleBorderRadius", 16);
                    setValue("styleBorderWidth", 2);
                    setValue("styleFontSize", 16);
                    break;
                  case "custom":
                    setValue("styleText", "스캔해주세요");
                    setValue("styleBorderColor", "#000000");
                    setValue("styleTextColor", "#000000");
                    setValue("styleBorderRadius", 16);
                    setValue("styleBorderWidth", 2);
                    setValue("styleFontSize", 16);
                    break;
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="테두리 스타일 선택" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="simple">심플</SelectItem>
                <SelectItem value="rounded">둥근 모서리</SelectItem>
                <SelectItem value="custom">
                  사용자 정의 (테두리 + 텍스트 자유 설정)
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleText() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleText"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>
            안내 문구 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="QR 코드에 표시할 안내 문구를 입력하세요."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBorderColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBorderColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            테두리 색상 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleTextColor() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleTextColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            안내 문구 색상 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <Input type="color" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBorderRadius() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBorderRadius"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            모서리 반지름 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                type="range"
                min="0"
                max="50"
                step="1"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-14 text-center">
                {field.value}px
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleFontSize() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleFontSize"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            폰트 사이즈 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                type="range"
                min="8"
                max="48"
                step="1"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-14 text-center">
                {field.value}px
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldStyleBorderWidth() {
  const { control } = useFormContext<QrcodeFormValues>();

  return (
    <FormField
      control={control}
      name="styleBorderWidth"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            테두리 굵기 <span className="text-xs">(선택)</span>
          </FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                type="range"
                min="1"
                max="20"
                step="1"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-14 text-center">
                {field.value}px
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
