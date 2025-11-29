from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# File metadata table: stores raw uploaded file info and path
class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False, index=True)  # ADDED
    filename = db.Column(db.String, nullable=False)
    filepath = db.Column(db.String, nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    filesize = db.Column(db.Integer)
    table_name = db.Column(db.String, nullable=False)

    user = db.relationship('User', backref=db.backref('uploaded_files', lazy='dynamic'))


# Documents table: one row per extracted Excel row / record
class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False, index=True)  # ADDED
    file_id = db.Column(db.Integer, db.ForeignKey('uploaded_files.id', ondelete='SET NULL'), nullable=True)

    table_name = db.Column(db.String, nullable=False)  

    # --- Document Details ---
    sr_code = db.Column(db.String)
    internal_document_number = db.Column(db.String)
    docno = db.Column(db.String, index=True)
    docname = db.Column(db.String, index=True)
    registrationdate = db.Column(db.String)
    dateofexecution = db.Column(db.String)

    # --- Parties ---
    purchasername = db.Column(db.String, index=True)
    sellername = db.Column(db.String, index=True)

    # --- Property Details ---
    propertydescription = db.Column(db.Text)
    marketvalue = db.Column(db.Float)
    consideration_amt = db.Column(db.Float)
    areaname = db.Column(db.String)
    sroname = db.Column(db.String)

    # --- Other ---
    raw_json = db.Column(db.Text)

    uploaded_file = db.relationship('UploadedFile', backref=db.backref('documents', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('documents', lazy='dynamic'))


# === New: persistent selected entries (one row per saved selection) ===
class SelectedEntry(db.Model):
    __tablename__ = 'selected_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False, index=True)  # ADDED
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    label = db.Column(db.String)  # optional label snapshot (docname/docno)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    table_name = db.Column(db.String, nullable=False)

    document = db.relationship('Document', backref=db.backref('selected_entries', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('selected_entries', lazy='dynamic'))


# === New: search history records ===
class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False, index=True)  # ADDED
    params_json = db.Column(db.Text)   # store search parameters as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('search_history', lazy='dynamic'))


# --- New: User model for authentication ---
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(120))
    phone1 = db.Column(db.String(20), nullable=True)
    phone2 = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)   # Super Admin flag
    is_active = db.Column(db.Boolean, default=True)   # Active/Inactive
    expiry_date = db.Column(db.DateTime, nullable=True)

    def as_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone1": self.phone1,
            "phone2": self.phone2,
            "address": self.address,
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None
        }
