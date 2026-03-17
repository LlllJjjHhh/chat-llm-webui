"""Tests for Chat LLM WebUI API"""

import pytest
import sys
sys.path.insert(0, '.')
from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_get_config(client):
    """Test getting config endpoint"""
    response = client.get('/api/config')
    assert response.status_code == 200
    data = response.get_json()
    assert 'temperature' in data
    assert 'max_new_tokens' in data
    assert 'top_p' in data


def test_index(client):
    """Test index page serves correctly"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Chat LLM WebUI' in response.data
