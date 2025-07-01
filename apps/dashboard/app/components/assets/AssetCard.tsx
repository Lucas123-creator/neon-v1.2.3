"use client";

import {
  Image,
  Video,
  FileText,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, Button } from "@neon/ui";
import type { RouterOutputs } from "@neon/api";

type Asset = RouterOutputs["assets"]["getAssets"]["assets"][0];

interface AssetCardProps {
  asset: Asset;
  onApprove: () => void;
  onReject: () => void;
}

export function AssetCard({ asset, onApprove, onReject }: AssetCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(asset.type)}
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(asset.status)}`}
            >
              {getStatusIcon(asset.status)}
              <span className="capitalize">{asset.status}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {asset.type === "image" && asset.url ? (
            <img
              src={asset.url}
              alt={asset.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : asset.type === "video" && asset.url ? (
            <video
              src={asset.url}
              className="w-full h-full object-cover rounded-lg"
              controls={false}
            />
          ) : (
            <div className="text-center">
              {getTypeIcon(asset.type)}
              <p className="text-xs text-muted-foreground mt-2">
                {asset.type === "copy" || asset.type === "text"
                  ? "Text Content"
                  : "No Preview"}
              </p>
            </div>
          )}
        </div>

        {/* Title and Content */}
        <div className="space-y-2">
          <h3 className="font-medium line-clamp-2">{asset.title}</h3>
          {asset.content && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {asset.content}
            </p>
          )}
        </div>

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{asset.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{asset.agent && <span>{asset.agent.name}</span>}</div>
          <span>
            {(() => {
              const dateObj = new Date(asset.createdAt);
              return dateObj.toLocaleDateString("en-US");
            })()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {asset.status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onApprove}
                className="text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          {asset.status === "approved" && (
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Revision Info */}
        {asset._count?.revisions && asset._count.revisions > 0 && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            {asset._count.revisions} revision
            {asset._count.revisions > 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
