CREATE TABLE "urls" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redirect_to" TEXT NOT NULL,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "url_clicks" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_url_id" TEXT NOT NULL,

    CONSTRAINT "url_clicks_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "url_clicks" ADD CONSTRAINT "url_clicks_fk_url_id_fkey" FOREIGN KEY ("fk_url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
