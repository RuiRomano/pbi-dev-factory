import { entity, role, uuid, text, date } from "@microsoft/rayfin-core";

@entity()
@role("authenticated", ["create", "read"], {
    policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class KpiComment {
    @uuid() id!: string;
    @text() user_id!: string;
    @text({ min: 1, max: 40 }) kpiId!: string;
    @text({ min: 1, max: 21 }) period!: string;
    @text({ min: 1, max: 2000 }) body!: string;
    @date() createdAt!: Date;
}
