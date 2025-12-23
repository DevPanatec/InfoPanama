#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para scrapear Instagram usando Instaloader
Extrae posts de @focopanama con imágenes

INSTALACIÓN:
pip install instaloader

USO:
python instagram-instaloader.py
"""

import instaloader
import json
import sys
import io
import os
from datetime import datetime
from pathlib import Path

# Configurar encoding para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    env_path = Path('.') / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    print("⚠️  dotenv no instalado. Instala con: pip install python-dotenv")
    pass

# Leer credenciales de Instagram desde .env
INSTAGRAM_USERNAME = os.getenv('INSTAGRAM_USERNAME')
INSTAGRAM_PASSWORD = os.getenv('INSTAGRAM_PASSWORD')

def scrape_instagram(username="focopanama", max_posts=10):
    """
    Scrapea posts de Instagram usando Instaloader

    Args:
        username: Usuario de Instagram a scrapear
        max_posts: Número máximo de posts a extraer

    Returns:
        Lista de posts en formato JSON
    """

    print(f"📸 Scrapeando Instagram: @{username}")
    print("=" * 60)

    # Crear instancia de Instaloader
    L = instaloader.Instaloader(
        download_pictures=False,  # No descargar imágenes (solo URLs)
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
    )

    # Login con Instagram (REQUERIDO)
    if INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD:
        print("🔐 Iniciando sesión en Instagram...")
        try:
            # Intentar cargar sesión existente primero
            session_file = f".instaloader-session-{INSTAGRAM_USERNAME}"
            if Path(session_file).exists():
                print("   📁 Cargando sesión guardada...")
                L.load_session_from_file(INSTAGRAM_USERNAME, session_file)
                print("   ✅ Sesión cargada correctamente")
            else:
                print("   🔑 Haciendo login...")
                L.login(INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD)
                print("   ✅ Login exitoso")
                # Guardar sesión para próximas ejecuciones
                L.save_session_to_file(session_file)
                print("   💾 Sesión guardada para futuros usos")
        except Exception as e:
            print(f"   ❌ Error en login: {e}")
            print("\n💡 Verifica tus credenciales en .env:")
            print("   INSTAGRAM_USERNAME=tu_usuario")
            print("   INSTAGRAM_PASSWORD=tu_password")
            return []
    else:
        print("❌ ERROR: Se requieren credenciales de Instagram")
        print("\n📝 Agrega estas variables a packages/crawler/.env:")
        print("   INSTAGRAM_USERNAME=tu_usuario")
        print("   INSTAGRAM_PASSWORD=tu_password")
        print("\n💡 Puedes crear una cuenta Instagram nueva solo para scraping")
        return []

    try:
        print(f"\n🔍 Obteniendo perfil de @{username}...")
        profile = instaloader.Profile.from_username(L.context, username)

        print(f"✅ Perfil encontrado: {profile.full_name}")
        print(f"📊 Total de posts: {profile.mediacount}")
        print(f"\n⏳ Extrayendo {max_posts} posts más recientes...\n")

        posts_data = []

        for idx, post in enumerate(profile.get_posts()):
            if idx >= max_posts:
                break

            try:
                # Extraer datos del post
                caption = post.caption if post.caption else "Sin descripción"

                # Limpiar caption
                clean_caption = caption.replace('\n', ' ').replace('\r', '')

                # Limitar a 500 caracteres para no saturar
                if len(clean_caption) > 500:
                    clean_caption = clean_caption[:500] + "..."

                # Crear título
                title = clean_caption[:100] + "..." if len(clean_caption) > 100 else clean_caption

                post_data = {
                    "title": f"Instagram (@{username}): {title}",
                    "url": f"https://www.instagram.com/p/{post.shortcode}/",
                    "sourceUrl": f"https://www.instagram.com/p/{post.shortcode}/",
                    "sourceName": "Foco",
                    "sourceType": "social_media",
                    "content": clean_caption,
                    "author": "Foco Panama",
                    "publishedDate": post.date_utc.isoformat(),
                    "scrapedAt": datetime.utcnow().isoformat(),
                    "category": "redes sociales",
                    "imageUrl": post.url,  # URL de la imagen
                    "likes": post.likes,
                    "comments": post.comments,
                }

                posts_data.append(post_data)

                print(f"✅ Post {idx + 1}/{max_posts}: {title[:60]}...")
                print(f"   📅 Fecha: {post.date_utc.strftime('%Y-%m-%d %H:%M')}")
                print(f"   🖼️  Imagen: {post.url[:60]}...")
                print(f"   ❤️  Likes: {post.likes}, 💬 Comments: {post.comments}")
                print()

            except Exception as e:
                print(f"⚠️  Error procesando post {idx + 1}: {e}")
                continue

        print("=" * 60)
        print(f"🎉 Scraping completado: {len(posts_data)} posts extraídos")
        print("=" * 60)

        # Guardar en archivo JSON
        output_file = "instagram-posts.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(posts_data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 Posts guardados en: {output_file}")
        print("\n📋 Próximos pasos:")
        print("   1. Importa estos posts a Convex")
        print("   2. Ejecuta el extractor de claims")
        print("   3. Los claims tendrán imágenes automáticamente\n")

        return posts_data

    except instaloader.exceptions.ProfileNotExistsException:
        print(f"❌ Error: El perfil @{username} no existe")
        return []

    except instaloader.exceptions.ConnectionException as e:
        print(f"❌ Error de conexión: {e}")
        print("\n💡 Solución:")
        print("   Instagram puede estar bloqueando el acceso sin login.")
        print("   Descomenta las líneas de L.login() en el código y agrega credenciales.")
        return []

    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return []

if __name__ == "__main__":
    # Configuración
    USERNAME = "focopanama"
    MAX_POSTS = 15  # Número de posts a extraer

    # Ejecutar scraper
    posts = scrape_instagram(USERNAME, MAX_POSTS)

    if posts:
        sys.exit(0)
    else:
        sys.exit(1)
